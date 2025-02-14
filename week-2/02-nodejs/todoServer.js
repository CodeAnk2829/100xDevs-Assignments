/**
  You need to create an express HTTP server in Node.js which will handle the logic of a todo list app.
  - Don't use any database, just store all the data in an array to store the todo list data (in-memory)
  - Hard todo: Try to save responses in files, so that even if u exit the app and run it again, the data remains (similar to databases)

  Each todo has a title and a description. The title is a string and the description is a string.
  Each todo should also get an unique autogenerated id every time it is created
  The expected API endpoints are defined below,
  1.GET /todos - Retrieve all todo items
    Description: Returns a list of all todo items.
    Response: 200 OK with an array of todo items in JSON format.
    Example: GET http://localhost:3000/todos
    
  2.GET /todos/:id - Retrieve a specific todo item by ID
    Description: Returns a specific todo item identified by its ID.
    Response: 200 OK with the todo item in JSON format if found, or 404 Not Found if not found.
    Example: GET http://localhost:3000/todos/123
    
  3. POST /todos - Create a new todo item
    Description: Creates a new todo item.
    Request Body: JSON object representing the todo item.
    Response: 201 Created with the ID of the created todo item in JSON format. eg: {id: 1}
    Example: POST http://localhost:3000/todos
    Request Body: { "title": "Buy groceries", "completed": false, description: "I should buy groceries" }
    
  4. PUT /todos/:id - Update an existing todo item by ID
    Description: Updates an existing todo item identified by its ID.
    Request Body: JSON object representing the updated todo item.
    Response: 200 OK if the todo item was found and updated, or 404 Not Found if not found.
    Example: PUT http://localhost:3000/todos/123
    Request Body: { "title": "Buy groceries", "completed": true }
    
  5. DELETE /todos/:id - Delete a todo item by ID
    Description: Deletes a todo item identified by its ID.
    Response: 200 OK if the todo item was found and deleted, or 404 Not Found if not found.
    Example: DELETE http://localhost:3000/todos/123

    - For any other route not defined in the server return 404

  Testing the server - run `npm run test-todoServer` command in terminal
 */
  const express = require('express');
 const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.get('/todos', (req, res) => {
  fs.readFile('todos.json','utf-8', (err, data) => {
    if(err) {
      throw err;
    } else {
      const items = JSON.parse(data);
      let todos = [];
      items.forEach(item => {
        const todo = {
          "title": item.title,
          "description": item.description
        }
        todos.push(todo);
      });
      res.status(200).json(todos);
    }
  });
});

app.get('/todos/:id', (req, res) => {
  const _id = req.params.id;
  fs.readFile('todos.json', 'utf-8', (err, data) => {
    if(err) {
      throw err;
    } else {
      const items = JSON.parse(data);
      for(let i = 0; i < items.length; ++i) {
        if(_id == items[i]["id"]) {
          res.status(200).json(items[i]);
        }
      }
      res.status(404).send("Not found");
    }
  })
});

app.post('/todos', (req, res) => {
  const { title, completed, description } = req.body;
  const key = new Date().getTime();

  fs.readFile('todos.json', 'utf-8', (err, data) => {
    if(err) {
      throw err
    } else {
      const item = {
        id: key,
        title: title, 
        completed: completed,
        description: description
      }
      // store the new todo into the database as well
      let items = JSON.parse(data);
      items.push(item);
      data = JSON.stringify(items);

      fs.writeFile('todos.json', data, (err) => {
        if(err) {
          throw err
        }
      });

      res.status(201).json({ id: item.id });
    }
  })
});

app.put('/todos/:id', (req, res) => {
  const _id = req.params.id;
  const { title, completed } = req.body;
 
  fs.readFile('todos.json', 'utf-8', (err, data) => {
    if(err) {
      throw err
    } else {
      let items = JSON.parse(data);
      let isFound = false;
      
      for(let i = 0; i < items.length; ++i) {
        if(_id == items[i]["id"]) {
          items[i]["title"] = title;
          items[i]["completed"] = completed;
          isFound = true;
        }
      }
      
      if(isFound == false) {
        res.status(404).send("File not found");
      }
      data = JSON.stringify(items);

      fs.writeFile('todos.json', data, (err) => {
        if(err) throw err
      });
      res.sendStatus(200);
    }
  })
});

app.delete('/todos/:id', (req, res) => {
  const _id = req.params.id;

  fs.readFile('todos.json', 'utf-8', (err, data) => {
    if(err) {
      throw err;
    }
    
    let items = JSON.parse(data);
    const previousLength = items.length;

    // delete the desired todo
    items = items.filter((element) => {
      return element.id != _id;
    });
    
    if(previousLength === items.length) {
      res.status(404).send("File not found");
    } else {
      data = JSON.stringify(items);
      
      fs.writeFile('todos.json', data, (err) => {
        if(err) throw err;
      });
      
      res.sendStatus(200);
    }
  })
});
  module.exports = app;