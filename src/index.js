import { JSONEditor } from '@json-editor/json-editor'

let editor

var MurmurationsNodeUI = function(options){
  this.gebi = function(id){return document.getElementById(id)}

  this.superSchema = {
    title : "Murmurations Node",
    properties : {},
    required : []
  }

  this.errors = [];

  this.options = {
    indexUrl:"https://murmurations.network/index",
    libraryBaseUrl : "https://raw.githubusercontent.com/MurmurationsNetwork/MurmurationsLibrary/master/",
    dataStorageEndpoint:null,
    profileUrl:"murmurations.json",
    containerId:"MurmurationsNodeUI",
    activeSchemas: [],
    startingContent: {}
  }

  Object.getOwnPropertyNames(options).forEach(optionName =>
    this.options[optionName] = options[optionName]
  );

  this.container = this.gebi(this.options.containerId);

  if(!(this.container instanceof Element)){
    this.errors.push({
      message:"Invalid container element ID",
      level:"fatal"
    })
    return;
  }

  this.activeSchemas = options.activeSchemas;

  this.availableSchemas =  [
    {
      "name" : "Test schema 1",
      "url" : "https://raw.githubusercontent.com/MurmurationsNetwork/MurmurationsLibrary/master/schemas/demo-v1.json"
    },
    {
      "name" : "Test schema 2",
      "url" : null //"http://localhwewost:1234/test_schema_2.json"
    },
  ]

  this.initUi = () => {

    this.errorContainer = this.container.appendChild(document.createElement('div'));

    var schemaSelectForm = this.container.appendChild(document.createElement('form'));
    schemaSelectForm.innerHTML = "<div>Select schemas</div>";
    this.availableSchemas.forEach((schema) => {
        //optionContainer = document.createNode('div');
        var optionLabel = document.createElement('label')
        console.log(schema.name)
        optionLabel.innerHTML = schema.name;
        var optionInput = document.createElement('input')
        optionInput.value = schema.url;
        optionInput.type = 'checkbox';
        optionInput.style.width = '20px';
        if(this.activeSchemas.includes(schema.url)){
          optionInput.checked = true;
        }
        optionInput.addEventListener('change',this.schemaInputChanged);
        schemaSelectForm.appendChild(optionInput)
        schemaSelectForm.appendChild(optionLabel)
    });

    this.editorContainer = this.container.appendChild(document.createElement('div'))
    this.editorContainer.id = "editorContainer";

    if(this.activeSchemas.length > 0){
      this.updateSchemas();
    }

  }

  this.schemaInputChanged = (e) => {
    if(e.target.checked == true){
      this.activeSchemas.push(e.target.value);
    }else{
      if(this.activeSchemas.includes(e.target.value)){
        this.activeSchemas = this.activeSchemas.filter(value => value !== e.target.value)
      }
    }
    this.updateSchemas();
  }

  this.addSchema = (schema) => {

    console.log("Adding schema:")
    console.log(schema)

    var fieldNames = Object.getOwnPropertyNames(schema.properties)

    fieldNames.forEach(field =>
      this.superSchema.properties[field] = schema.properties[field]
    );

    if(schema.required){
      this.superSchema.required = schema.required.concat(this.superSchema.required.filter((item) => schema.required.indexOf(item) < 0))
    }


    schema = this.superSchema
    console.log("Superschema:")
    console.log(schema)

    var startval = this.options.profileData

    this.gebi("test").innerHTML = "<pre>"+JSON.stringify(schema,0,2)

    this.editorContainer.innerHTML = "";

    editor = new JSONEditor(this.editorContainer, {
      ajax: true,
      ajaxBase: this.options.libraryBaseUrl,
      disable_properties: true,
      disable_edit_json: true,
      disable_collapse: true,
      schema,
      startval
    })

    //this.showErrors();

    //console.log(this.errors)

  }

  this.showErrors = () => {
    if (this.errors.length > 0){
      this.errors.forEach(
        error => this.showError(error)
      )
    }
  }

  this.showError = (error) => {
    errorEl = this.notificationContainer.appendChild(document.createElement('div'));
    errorEl.innerHTML = error.message;
    errorEl.classNames = errorEl.classNames += error.level
  }

  this.updateSchemas = () =>{
    this.superSchema = {
      title : "Murmurations Node",
      properties : {},
      required : []
    }
    if(this.activeSchemas.length == 0){
      this.editorContainer.innerHTML = "";
    }else{
      this.activeSchemas.forEach(
        schemaUrl => this.updateSchema(schemaUrl)
      )
    }
  }

  this.updateSchema = schemaUrl => {


    let err404 = false

    if (!schemaUrl) {
      this.errors.push({
        message:"Invalid schema URL: "+schemaUrl
      })
      return
    }

    window.fetch(schemaUrl).then(response => {
      if (response.status === 404) {
        err404 = true
      } else {
        err404 = false
        return response.json()
      }
    }).then(schema => {
      if (err404 === false) {
        this.addSchema(schema);
      } else {
        this.errors.push(
          {
            message:"Could not retrieve schema: "+schema+". Check the URL of the schema you are trying to retrieve."
          }
        )
        return
      }
    }).catch(e => {
      if (e.message === 'Failed to fetch') {
        this.errors.push(
          {
            message:"Could not retrieve schema: "+schema+". Check your internet connection."
          }
        )
      }
    })
  }

}

/*
document.getElementById('submit').addEventListener('click', function () {
  document.getElementById('profile').innerHTML = JSON.stringify(editor.getValue(), 0, 2)
  document.getElementById('post').style.display = 'block'
  document.getElementById('result').style.display = 'none'
})

document.getElementById('post').addEventListener('click', function () {
  document.getElementById('result').style.display = 'block'
  document.getElementById('result').innerHTML = 'Success or failure message depending on the result'
  console.log(JSON.stringify(editor.getValue(), 0, 2))
})
*/
var ui = new MurmurationsNodeUI(
  {
    activeSchemas : ["http://localhost:1234/test_schema_2.json"],
    indexUrl:"",
    libraryUrl :"",
    dataStorageEndpoint:"",
    profileUrl:"",
    profileData : {
      favoriteCat: "Meow!!!"
    }
  }
).initUi();
