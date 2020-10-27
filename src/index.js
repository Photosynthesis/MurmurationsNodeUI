import { JSONEditor } from '@json-editor/json-editor'

let editor

const schemaList = document.getElementById('schema-list')

const schemaListChanged = schemaUrl => {
  fetchAndDisplaySchema(schemaUrl)
}

schemaList.addEventListener('change', () => schemaListChanged(schemaList.value))

const startval = JSON.parse(`
{
    "profileUrl": "https://ic3.dev/test1.json",
    "linkedSchemas": [
        "demo-v1"
    ],
    "name": "IC3 Dev",
    "url": "https://ic3.dev",
    "mission": "We make stuff...",
    "geolocation": {
        "latitude": 12.121212,
        "longitude": 13.131313
    },
    "keywords": [
        "open-source",
        "beer"
    ]
}`)

const fetchAndDisplaySchema = schemaUrl => {
  let err404 = false

  if (!schemaUrl) {
    document.getElementById('submit').style.display = 'none'
    document.getElementById('profile').innerHTML = ''
    editor.destroy()
    document.getElementById('post').style.display = 'none'
    document.getElementById('result').style.display = 'none'
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
      editor = new JSONEditor(document.getElementById('schema_editor'), {
        ajax: true,
        ajaxBase: schema.id,
        disable_properties: true,
        disable_edit_json: true,
        disable_collapse: true,
        schema,
        startval
      })
      document.getElementById('submit').style.display = 'block'
      document.getElementById('error').style.display = 'none'
      if (document.getElementById('profile').innerHTML === '') {
        document.getElementById('post').style.display = 'none'
      }
    } else {
      document.getElementById('error').style.display = 'block'
      document.getElementById('error').innerHTML = '<p><strong>Could not retrieve schema</strong></p><p>Check the URL of the schema you are trying to retrieve.</p>'
    }
  }).catch(e => {
    if (e.message === 'Failed to fetch') {
      document.getElementById('error').style.display = 'block'
      document.getElementById('error').innerHTML = '<p><strong>Could not retrieve schema</strong></p><p>Check your internet connection.</p>'
    }
  })
}

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
