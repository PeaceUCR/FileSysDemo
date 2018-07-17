var express = require('express');
var router = express.Router();

var fs = require('fs');
const path = require('path');
var busboy = require('busboy');

const File = require('../model/file');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile(path.resolve(__dirname+'/../public/html/dashboard.html'));
});

router.get('/player', function(req, res, next) {
    res.sendFile(path.resolve(__dirname+'/../public/html/audioplayer.html'));
});


//https://www.npmjs.com/package/busboy
router.post('/file', function(req, res, next) {
    console.log(req.headers['content-type']);
    console.log(req.body);
    let resStr ='';
    let bboy = new busboy({ headers: req.headers });
    bboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
        resStr = 'File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype;
        console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);

        File.findOne({'name': filename}, function (err, f) {
            if(err){
                res.status(400);
                res.send("db err");
            } else if(f){
                res.status(400);
                res.send("file already exist, please try another file name");
            }else {
                const newFile = new File();
                newFile.name = filename;
                newFile.displayName = filename;
                newFile.mimeType = mimetype;
                newFile.save(function (e) {
                    if(e){
                        res.status(400);
                        res.send("save with error");
                    }else{
                        file.pipe(fs.createWriteStream('public/uploads/'+filename));
                        res.send(resStr);
                    }

                })
            }


        })

        //store upload file

        /*
         file.on('data', function(data) {
         console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
         });
         file.on('end', function() {
         console.log('File [' + fieldname + '] Finished');
         });
         */
    });
    /*
    bboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
        console.log('Field [' + fieldname + ']: value: ' + val);
    });
    bboy.on('finish', function() {
        console.log('Done upload!');
        res.send(resStr);
    });
    */
    req.pipe(bboy);// pipe req to configed busboy
});


router.get('/all', function(req, res, next) {
    /*
    fs.readdir(path.resolve(__dirname+'/../public/uploads'),function (err, files) {
        if(err){
            res.status(400);
            res.send("read /uploads with error:"+err);
        }
        res.send(files);
    });
    */

    File.find({},function (err, files) {
        if(err){
            res.status(400);
            res.send("read db with error:"+err);
        }else{
            res.send(files);
        }
    })
});

router.get('/file/:name', function(req, res, next) {
    console.log('get file'+req.params.name);
    if(req.params.name&&req.params.name.length>0){

            res.setHeader('Content-disposition', 'attachment; filename='+req.params.name);
            fs.createReadStream(path.resolve(__dirname+'/../public/uploads/'+req.params.name), {highWaterMark: 32 * 1024}).pipe(res).on('finish',function () {
                console.log('done download')
            });

    }else {
        res.status(400);
        res.send("invalid file name");
    }
});

router.delete('/file/:name', function(req, res, next) {
    console.log('delete file'+req.params.name);
    if(req.params.name&&req.params.name.length>0){
        File.deleteOne({ name: req.params.name }, function (err) {
            if (err){
                res.status(400);
                res.send("db delete err");
            }else{
                fs.unlink(path.resolve(__dirname+'/../public/uploads/'+req.params.name), function (err) {
                    if(err){
                        res.status(400);
                        res.send(err);
                    }else {
                        res.send(req.params.name+ " delete successfully");
                    }
                });
            };
        });
    }else {
        res.status(400);
        res.send("invalid file name");
    }
});

router.put('/file/:name', function(req, res, next) {
    console.log('update file'+req.params.name);
    console.log(req.body);
    if(req.params.name&&req.params.name.length>0){

        File.updateOne({ name: req.params.name }, { displayName: req.body.displayName }, function(err) {
            if(err){
                res.status(400);
                res.send("update with err");
            }else{
                res.send("update with new name "+req.body.displayName);
            }
        });

    }else {
        res.status(400);
        res.send("invalid file name");
    }
});

router.get('/size', function(req, res, next) {
    getUploadDirectorySize(function (err, total) {
        if(err) {
            res.status(400);
            res.send('get size wit error');
        }else{
            let mb = parseFloat(total/1000000).toFixed(2);
            res.send({size: mb, unit: 'MB'});
        }
    })
});

function getUploadDirectorySize(cb) {
    let total = 0;

    fs.readdir(path.resolve(__dirname+'/../public/uploads'),function (err, files) {
        if(err){
            cb(err);
        }else{
            //how to callback recursive
            //check all promise resolve
            files.forEach(function (item, index, items) {
                total = total+fs.lstatSync(path.resolve(__dirname+'/../public/uploads/'+item)).size;
            });

            cb(null, total);
        }

    });
}

module.exports = router;
