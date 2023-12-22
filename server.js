const express = require('express');
const path = require('path');
const fs = require('fs');
const uuid = require('./helpers/uuid')

const app = express();

const PORT = process.env.PORT || 3001;

// Middleware for parsing application/json and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Pulls public folder files
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/notes.html'));
});

app.get('/api/notes', (req, res) => {
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
        if (err) {
            res.status(500).json(err);
        } else {
            // Convert string into JSON object
            const parsedNotes = JSON.parse(data);
            res.status(200).json(parsedNotes);
        }
    });
});

// Deletes note object based on id
app.delete('/api/notes/:id', (req, res) => {
    // Delete request received
    console.info(`${req.method} request received to delete a note`);
  
    // Pulls the object based of the id
    const noteId = req.params.id;
  
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
      if (err) {
        res.status(500).json(err);
      } else {
        // Converts string into JSON object
        const parsedNotes = JSON.parse(data);
        // Deleted note removed from array
        const updatedNotes = parsedNotes.filter((note) => note.id !== noteId);
  
        fs.writeFile('./db/db.json', JSON.stringify(updatedNotes), (err, data) => {
          if (err) {
            res.status(500).json(err);
          } else {
            res.status(200).json({ status: 'success' });
          }
        });
      }
    });
  });

// Add note
app.post('/api/notes', (req, res) => {
    // Post recieved
    console.info(`${req.method} request received to add a note`);

    // Destructure for items in req.body
    const { title, text } = req.body;

    // Verification
    if (title && text) {
        const newNote = {
            title,
            text,
            id: uuid(),
        };

        const userNote = {
            status: 'success',
            body: newNote,
        };
        console.log(userNote);
        // 201 = 'created'
        fs.readFile('./db/db.json', 'utf8', (err, data) => {
            if (err) {
                res.status(500).json(err);
            } else {
                // Convert string into JSON object
                const parsedNotes = JSON.parse(data);
                parsedNotes.push(newNote);
                fs.writeFile('./db/db.json', JSON.stringify(parsedNotes), (err, data) => {
                    if (err) {
                        res.status(500).json(err);
                    } else {
                        res.status(201).json(newNote);
                    }
                });
            }
        });
    } else {
        // bad request = 400
        res.status(400).json('Enter a title and text for your note');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
