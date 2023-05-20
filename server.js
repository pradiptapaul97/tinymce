const express = require('express');
app = express();
const multer = require('multer');
const request_param = multer();
const fs = require('fs');
const {join} = require('path')
const engine = require('ejs-locals');
app.use(express.static('./public'));
app.set('views', './views');
app.engine('ejs', engine);
app.set('view engine', 'ejs'); // set up ejs for templating
join(__dirname, '/app');


const Storage = multer.diskStorage({
    destination: (req, file, callback) => {
        if (!fs.existsSync('./public/uploads')) {
            fs.mkdirSync('./public/uploads');
            fs.mkdirSync("./public/uploads/thumb");
        }
        callback(null, "./public/uploads");
    },
    filename: (req, file, callback) => {
        callback(null,file.fieldname + "_" + Date.now() + "_" + file.originalname.replace(/\s/g, '_'));
    }
});

const uploadFile = multer({
    storage: Storage
});

app.get("/", function (req, res) {
    res.render("add.ejs");
});

app.get("/front/view", function (req, res) {
    req.body = fs.existsSync('file.json')?JSON.parse(fs.readFileSync('file.json',{})):{};
    res.render("view.ejs",{data:req.body});
});

app.get("/view", function (req, res) {
    req.body = fs.existsSync('file.json')?JSON.parse(fs.readFileSync('file.json',{})):{};
    res.render("edit.ejs",{data:req.body});
});

app.post('/blob/file/insert', uploadFile.any(), async (req, res) => {
    try {
        let image = null;
        if (req.files && req.files.length > 0) {
            for (const iterator of req.files) {
                if (iterator.fieldname === 'image') {
                    image = iterator.filename;
                }
            }
        }
        res.status(200).send({ "image": image});
    } catch (error) {
        res.status(error.status||500).send(error);
    }
});

app.post('/blob/file/delete', uploadFile.any(), async (req, res) => {
    try {
        let image = req.body.image;
        if (req.body.image && req.body.image !== '') {
            fs.unlinkSync(`./public/uploads/${req.body.image}`)
        }
        res.status(200).send({ "image": image});
    } catch (error) {
        res.status(error.status||500).send(error);
    }
});

app.post('/data/insert', uploadFile.any(), async (req, res) => {
    try {
        fs.writeFileSync('file.json', JSON.stringify(req.body));
        res.redirect('/view');
    } catch (error) {
        res.status(error.status||500).send(error);
    }
});

app.post('/data/update', uploadFile.any(), async (req, res) => {
    try {
        fs.writeFileSync('file.json', JSON.stringify(req.body));
        res.redirect('/view');
    } catch (error) {
        res.status(error.status||500).send(error);
    }
});

app.listen(3000, () => {
    console.log("Server running port 3000");
})
