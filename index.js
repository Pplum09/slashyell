var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var users = [];

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    console.log('a user connected');
    
    var user_name = "";
    
    socket.on('login', function(name) {
        
        // make sure user isnt already logged on
        if (!contains(name)) {
            console.log(name + " connected");
            user_name = name;

            // add to global array
            users.push(user_name);
            io.emit('user-change', users);
            io.emit('login-success');
            io.emit('chat message', user_name + " has entered the room!");
        }    
        
        // error handle for user already logged on
        else {
            console.log(name + " already connected!");
            io.emit('login-error');
        }
    });
    
    // when user disconnects
    socket.on('logout', function(){
        
        // make sure user exists in users group
        if (contains(user_name)) {
            console.log(user_name + " disconnected");
        
            // remove from global array
            // find position
            var value = get_index(user_name);
            
            if (value > -1) {
            
                // remove from global array
                users.splice(value, 1); 
                io.emit('user-change', users);
                io.emit('logout-success');
                io.emit('chat message', user_name + " has left the room!");
            }
            
            else {
                console.log("could not find index to log out")
                io.emit("logout-error");
            }
            
        }
        
        // error handle for user already logged out
        else {
            console.log("contact admin: user does not exist in users array");
            io.emit('logout-error');
        }
    });
    
    // on update call
    socket.on('update', function() {
        io.emit('user-change', users);
    });
    
    // when a chat message is recieved
    socket.on('chat message', function(msg){
        
        // make sure user is logged in
        console.log('message: ' + msg);
        io.emit('chat message', user_name + ": " + msg);
    });
    
    // if window is refreshed on logged on, wipe traces
    socket.on('disconnect', function() {
        
        console.log('user has refreshed browser');
        
        // make sure user exists in users group
        if (contains(user_name)) {
            console.log(user_name + " disconnected");
        
            // remove from global array
            // find position
            var value = get_index(user_name);
            
            if (value > -1) {
            
                // remove from global array
                users.splice(value, 1); 
                io.emit('user-change', users);
                io.emit('logout-success');
                io.emit('chat message', user_name + " has left the room!");
            }
            
            else {
                console.log("could not find index to log out")
                io.emit("logout-error");
            }
            
        }
        
        // error handle for user already logged out
        else {
            console.log("contact admin: user does not exist in users array");
            io.emit('logout-error');
        }
    });
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});

function contains(user) {
    
    for (var i = 0; i < users.length; i++) {
        if (users[i] == user) {
            return true;
        }
    }
         
    return false;
}

function get_index(user) {
    
    for (var i = 0; i < users.length; i++) {
        if (users[i] == user) {
            return i;
        }
    }
    
    return -1;
}