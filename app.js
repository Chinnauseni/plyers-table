const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const app = express();
const dbPath = path.join(__dirname, "cricketTeam.db");
app.use(express.json());
let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3001, () => {
      console.log("Server is Running at http://localhost:3001/");
    });
  } catch (e) {
    console.log(`Data base Error is ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

// return a list of all the players from the team
// API 1

const convertDbObject = (objectItem) => {
  return {
    playerId: objectItem.player_id,
    playerName: objectItem.player_name,
    jerseyNumber: objectItem.jersey_number,
    role: objectItem.role,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
        SELECT * 
        FROM 
        cricket_team`;
  const getPlayersQueryResponse = await db.all(getPlayersQuery);
  response.send(
    getPlayersQueryResponse.map((eachPlayer) => convertDbObject(eachPlayer))
  );
});

//post a player into data base
// API 2

app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const createPlayerQuery = ` 
    INSERT INTO cricket_team(player_name,
    jersey_number,role) 
    VALUES('${playerName}',${jerseyNumber},'${role}');`;
  const createPlayerQueryResponse = await db.run(createPlayerQuery);
  response.send(`Player Added to Team`);
});

// get the player details based on the player id
// API 3

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerDetailsQuery = `
       SELECT * 
       FROM
       cricket_team 
       WHERE 
       player_id = ${playerId};`;
  const getPlayerDetailsQueryResponse = await db.get(getPlayerDetailsQuery);
  response.send(convertDbObject(getPlayerDetailsQueryResponse));
});

//update the details of the player using player ID
// API 4

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;
  const updatePlayerDetailsQuery = `
      UPDATE
      cricket_team 
      SET
      player_name = '${playerName}' , jersey_number = ${jerseyNumber} , role = '${role}' 
      WHERE
      player_id = ${playerId};`;
  await db.run(updatePlayerDetailsQuery);
  response.send("Player Details Updated");
});

// delete the player details
//API 5

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
  DELETE FROM
    cricket_team
  WHERE
    player_id = ${playerId};`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
