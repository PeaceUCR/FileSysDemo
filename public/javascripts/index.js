/**
 * Created by hea on 7/12/18.
 */

$(document).ready(function () {


    $("#upload").on("change",function (e) {
        console.log(e.target.files[0]);
        if(e.target.files[0]&&e.target.files[0].name){
            //$("#uploadLabel").text(e.target.files[0].name);
            let myFormData = new FormData();
            myFormData.append('file', e.target.files[0]);
            $.ajax({
                url:"/file",
                type: "POST",
                data: myFormData,
                processData: false,
                contentType: false,
                async: true,
                cache: false
            }).then(function (response) {
                //$("#uploadLabel").text("Upload File....");
                $("#msg").text('upload success '+response);
                $("#msg").removeClass();
                $("#msg").addClass('success');
                e.target.value ='';
                load();
            }, function (err) {
                console.log(err);
                $("#msg").text('error '+err.responseText);
                $("#msg").removeClass();
                $("#msg").addClass('error');
            });
        }else{
            $("#msg").text("No File Selected");
            $("#msg").removeClass();
            $("#msg").addClass('error');
        }


    });

    function load() {
        $.get("/all").then(function (res) {
            console.log(res);
            if(res){
                $("#file-list").empty();
                res.forEach(function (item, index, items) {

                    let line = $("<div class='item'><p class='name'>"+item.displayName+"</p><p class='date'>"+new Date(item.timeCreated).toLocaleString()+"</p></div>");

                    let icons = $("<div class='icons'></div>");

                    let previewIcon =$("<a><i class='far fa-eye'></i></a>");

                    previewIcon.click(function () {
                        handlePreview(item.name,item.mimeType);
                    })

                    let downloadIcon =$("<a href='/file/"+item.name+"'><i class='fas fa-download'></i></a>");

                    let deleteIcon = $("<a><i class='fas fa-trash-alt'></i></a>");
                    deleteIcon.click( function () {
                        handleDelete(item.name);
                    });
                    let editIcon = $("<a><i class='fas fa-pencil-alt'></i></a>");

                    let editable = line.find("p:first")[0];

                    editIcon.click(function (){
                        //console.log(editable)
                        let preValue = editable.innerHTML;
                        editable.setAttribute('contenteditable', true);
                        editable.focus();
                        setInputCursorToEnd(editable);
                        editable.addEventListener('blur', function (event) {
                            console.log(editable.innerHTML);
                            if(editable.innerHTML.trim().length>0){
                                editable.setAttribute('contenteditable', false);
                                handleEdit(item.name,editable.innerHTML.trim());
                            }else {
                                event.target.innerHTML =preValue;
                                $("#msg").text('error invalid file name');
                                $("#msg").removeClass();
                                $("#msg").addClass('error');
                            }

                        })
                    });
                    if(item.mimeType.indexOf("image")>=0||item.mimeType.indexOf("video")>=0||item.mimeType.indexOf("audio")>=0){
                        icons.append(previewIcon);
                    }

                    icons.append(downloadIcon);
                    icons.append(editIcon);
                    icons.append(deleteIcon);
                    line.append(icons);
                    $("#file-list").append(line);
                })
            }
        }, function (err) {
            console.log(err);
        });

        loadIndicator();
    };

    function handleDelete(name) {
        $.ajax({
            url:"/file/"+name,
            type: "DELETE"
        }).then(function (response) {
            $("#msg").text(response);
            $("#msg").removeClass();
            $("#msg").addClass('success');
            //console.log('delete success '+response);
            load();
        });
    }

    function handleEdit(name, displayName) {

        $.ajax({
            url:"/file/"+name,
            type: "PUT",
            contentType: 'application/json',
            data:JSON.stringify({'displayName': displayName})
        }).then(function (response) {
            $("#msg").text('edit success: '+response);
            $("#msg").removeClass();
            $("#msg").addClass('success');
            load();
        }, function (err) {
            console.log(err);
            $("#msg").text('error '+err.responseText);
            $("#msg").removeClass();
            $("#msg").addClass('error');
        });
    }

    function setInputCursorToEnd(inputElement){
        var el = inputElement;
        var range = document.createRange();
        var sel = window.getSelection();
        range.setStart(el.childNodes[0], el.innerHTML.length);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
    }


    function loadIndicator() {
        $.get("/size").then(function (res) {
            console.log(res.size);
            $("#unit").text(res.unit);
           // let reload = setInterval(function () {
                let c = 0;
                $("#size").text(c.toFixed(2));
                let count = setInterval(function () {

                    c = c + 0.05;
                    if(c>=res.size){
                        c=res.size;
                        clearInterval(count);
                    }else{
                        $("#size").text(c.toFixed(2));
                    }
                }, 5);

        });
    }


    function handlePreview(name, type) {
        $("#preview").empty();
        let srcUrl = '/uploads/'+name;
        let closeIcon = $("<i class='fas fa-times-circle'></i>");
        closeIcon.click(function (event) {
            $("#preview").fadeOut();
            setTimeout(function () {
                $("#preview").empty();
            },500)
        });
        $("#preview").append(closeIcon);
        if(type.indexOf('image')>=0){
            let img = $("<img src ='"+srcUrl+"'/>");
            $("#preview").append(img);
            $("#preview").fadeIn();
        }else if(type.indexOf('video')>=0){
            let video = $('<video id="my-video" class="video-js" controls preload="auto"  data-setup="{}"> <source src="'+srcUrl+'" type="'+type+'"><p class="vjs-no-js">To view this video please enable JavaScript, and consider upgrading to a web browser that <a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a></p></video>');
            $("#preview").append(video);
            $("#preview").fadeIn();
        }else if(type.indexOf('audio')>=0){
            let audio = $('<iframe src = "http://localhost:3000/player?song='+name+'" width="800px" height="400px"></iframe>');
            $("#preview").append(audio);
            $("#preview").fadeIn();
        }
    }

    load();


    const socket =io('/notification', { path: '/socket.io', transports: ['websocket'], upgrade: false});

    socket.emit('join', null, function (error) {
        console.log('Join room err '+error) ;
    });

    socket.emit('fetchUsers');

    socket.on('getUsers', function (data) {
        console.log(data+' clint(s) currently working on this page');
        $("#notification").text(data+' client(s) currently working on this page');
        $("#notification").slideDown();
    });
});