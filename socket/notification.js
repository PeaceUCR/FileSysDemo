/**
 * Created by hea on 7/16/18.
 */

module.exports = function (io) {

    //map userid to socketid
    const socketList = {};
    //add namespace chat
    let nsp = io.of('/notification');

    nsp.on('connection', function (socket) {
        console.log('notification user connected');

        socket.on('join', function () {
            console.log('join notification');
        });


        socket.on('fetchUsers', function () {
            console.log('fetch');

            let socketsList = nsp.sockets;

            nsp.emit('getUsers', Object.keys(socketsList).length);

        });


        socket.on('disconnect', function(){
            console.log('disconnet notification');
            let socketsList = nsp.sockets;
            nsp.emit('getUsers', Object.keys(socketsList).length);
        });

    });


}
