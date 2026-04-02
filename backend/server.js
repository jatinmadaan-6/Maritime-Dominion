const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
    host: "localhost",
    user:  "root",  
    password: "jatin@616",
    database: "maritime"
});

//test route

app.get("/test", (req,res) =>
{
    res.send("test successful");
});

//get all logs
app.get("/logs" , (req,res) =>
{
    const q = "SELECT * FROM logs";
    db.query(q, (err, result) =>
    {
        if(err)
        {
            console.error(err);
            res.status(500).send("Error fetching logs");
        }
        else
        {
            res.json(result);
        }
    });
});

//add a log
app.post("/add-log" , (req,res) =>
{
    
 const { vessel_id, sulfur_level, waste_amount } = req.body;

 db.query(
    "INSERT INTO logs (vessel_id, sulfur_level, waste_amount) VALUES (?, ?, ?)",
    [vessel_id, sulfur_level, waste_amount],
    (err, result) =>{
        if(err)
        {
            console.error(err);
            res.status(500).send("Error adding log");
        }
        else
        {
            res.status(200).send("Log added successfully");
        }
    }
 )
    
});
app.post("/add-vessel", (req, res) => {
  const { name, imo_number } = req.body;

  db.query(
    "INSERT INTO vessels (name, imo_number) VALUES (?, ?)",
    [name, imo_number],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.send(err);
      }
      res.send("Vessel added");
    }
  );
});

app.get("/vessels", (req, res) => {
  const q = "SELECT * FROM vessels";

  db.query(q, (err, result) => {   

    if (err) {
      console.error(err);
      return res.status(500).send("Error fetching vessels");
    }

    res.json(result); 
  });
});
app.listen(3000, () =>
{
    console.log("Server is running on port 3000");
});