const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const { constrainedMemory } = require('process');

const app = express();
app.use(express.json());
app.use(bodyParser.json());

/*
POST /todos - Create a new todo item
Description: Creates a new todo item.
Request Body: JSON object representing the todo item.
Response: 201 Created with the ID of the created todo item in JSON format. eg: {id: 1}
Example: POST http://localhost:3000/todos
Request Body: { "title": "Buy groceries", "completed": false, description: "I should buy groceries" }

*/

app.post("/todos", (req, res) => {
  const tempTodo = {
    id: uuidv4(),
    title: req.body.title,
    completed: req.body.completed,
    description: req.body.description,
  };

  fs.readFile("/home/b84hasan/Downloads/Web Cohort 2.0/week-2/02-nodejs/ToDoServer/todos.json", "utf-8", (err, data) => {
    if (err) {
      res.status(500).send("Unable to read the file.");
      console.log("Unable to read the file:", err);
      return;
    }

    let todoList = [];
    
    if (data) {
      try {
        todoList = JSON.parse(data); // Convert JSON string to array of objects
      } catch (parseError) {
        res.status(500).send("Error parsing JSON data.");
        console.log("Error parsing JSON data:", parseError);
        return;
      }
    }

    todoList.push(tempTodo);

    fs.writeFile("todos.json", JSON.stringify(todoList, null, 2), (writeErr) => {
      if (writeErr) {
        res.status(500).send("Error writing to file.");
        console.log("Error writing to file:", writeErr);
        return;
      }

      console.log("Todo saved!");
      res.status(201).json({ id: tempTodo.id });
    });
  });
});

/*
GET /todos - Retrieve all todo items
    Description: Returns a list of all todo items.
    Response: 200 OK with an array of todo items in JSON format.
    Example: GET http://localhost:3000/todos
*/

app.get("/todos/",(req, res)=>{
  let todoList = [];
  fs.readFile("todos.json", "utf-8", (err, data)=>{
    if(err){
      res.status(500).send("Unable to read the file.");
      console.log("Unable to read the file:", err);
      return;
    }
    if(data){
      todoList = JSON.parse(data); //converted to Array form now -->  ARRAY of OBJECTS...
      res.status(200).json(todoList);
    }
    else{
      res.status(404).send("No todos...");
    }
  })
});

/*
2.GET /todos/:id - Retrieve a specific todo item by ID
Description: Returns a specific todo item identified by its ID.
Response: 200 OK with the todo item in JSON format if found, or 404 Not Found if not found.
Example: GET http://localhost:3000/todos/123
*/

app.get("/todos/:id", (req,res)=>{

  let todoID = req.params.id;
  let todoList = [];

  fs.readFile("todos.json", "utf-8",(err, data) => {
    if(err){
      res.status(500).send("Unable to read the file.");
      console.log("Unable to read the file:", err);
      return;
    }
    if(data){
    
      todoList = JSON.parse(data);
      let found = todoList.find((todo => todo['id'] === todoID));

      if(!found){
      res.status(404).send("No todo for this ID...");
      }
      else{
        res.status(200).json(found);
      }
    }
    else{
      res.status(404).send("No todos in the file...");
    }
  
  })
  
});


/*
DELETE /todos/:id - Delete a todo item by ID
    Description: Deletes a todo item identified by its ID.
    Response: 200 OK if the todo item was found and deleted, or 404 Not Found if not found.
    Example: DELETE http://localhost:3000/todos/123
*/

app.delete("/todos/:id", (req, res)=>{

    let todoList = [];
    let todoID = req.params.id;
    fs.readFile("todos.json", "utf-8", (err, data)=>{
      if(err){
        res.status(500).send("Unable to read the file.");
        console.log("Unable to read the file:", err);
        return;
      }
      if(data){
        todoList = JSON.parse(data);
        let index = todoList.findIndex((todo => todo['id'] === todoID));

        if(index == -1){
        res.status(404).send("No todo for this ID...");
        }
        else{
          todoList.splice(index, 1,);
          res.status(200).send("Item Deleted ...! ");
        }
      }
      else{
        res.status(404).send("No todo for this ID...");
      }

      fs.writeFile("todos.json", JSON.stringify(todoList, null, 2), (writeErr) => {
        if (writeErr) {
          res.status(500).send("Error writing to file.");
          console.log("Error writing to file:", writeErr);
          return;
        }
  
        console.log("Todo List Updated");
      });

    })

});

/*
PUT /todos/:id - Update an existing todo item by ID
    Description: Updates an existing todo item identified by its ID.
    Request Body: JSON object representing the updated todo item.
    Response: 200 OK if the todo item was found and updated, or 404 Not Found if not found.
    Example: PUT http://localhost:3000/todos/123
    Request Body: { "title": "Buy groceries", "completed": true }
*/
app.put("/todos/:id", (req, res)=>{
  let todoList = [];
  let todoID = req.params.id;

  fs.readFile("todos.json", "utf-8", (err, data)=>{
    if(err){
      res.status(500).send("Unable to read the file.");
      console.log("Unable to read the file:", err);
      return;
    }
    if(data){

      todoList = JSON.parse(data);
      let index = todoList.findIndex((todo => todo['id'] === todoID));

      if(index == -1){
        res.status(404).send("No todo for this ID...");
      }
      else{
        todoList[index]["title"] = req.body["title"];
        todoList[index]["completed"] = req.body["completed"];
        todoList[index]["description"] = req.body["description"];
      }

    }
    else{
      res.status(404).send("No todo for this ID...");
    }

    fs.writeFile("todos.json", JSON.stringify(todoList, null, 2), (writeErr) => {
      if (writeErr) {
        res.status(500).send("Error writing to file.");
        console.log("Error writing to file:", writeErr);
        return;
      }
      res.status(200).send("updated !");
    });
  });

});


app.use((req, res) => {
  res.status(404).send("Path Not Found... Please enter a valid path...");
});

app.listen(2000, () => {
  console.log('Server is running on port 2000');
});

