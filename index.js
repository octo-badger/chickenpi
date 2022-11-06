//*
// subvert the console
(function()
{
    let { log, debug, error } = global.console;
    global.console.log = (msg) => log(`log ${(new Date()).toISOString()}: ${msg}`);
    // global.console.debug = (msg) => debug(`dbg ${(new Date()).toISOString()}: ${msg}`);
    global.console.debug = () => {};
    // global.console.error = (msg) => 
    // {
    //     if(msg instanceof Error) console.log('is Error');
    //     if(msg.message) 
    //     {
    //         log(`has message: ${msg.message}`);
    //         log(`stack: ${msg.stack}`);
    //         log(`stackTraceLimit: ${Error.stackTraceLimit}`);
    //         msg.message = `err ${(new Date()).toISOString()}: ${msg.message}`;
    //         error(msg.message);
    //         error(msg.stack)
    //     }
    //     else
    //         error(msg);     
    // };
})()
//*/


// const http = require('http');
const socketio = require('socket.io-client');
const Gpio = require('pigpio').Gpio;

// const server = http.createServer();
//const socket = io(server);
const socket = socketio('ws://pihub:8080');                             // move url to config

// const port = process.env.PORT || 8080;
//server.listen(port, () => console.log(`listening on ${port}`));

/*
setInterval(() => 
{
    console.log('emitting');
    socket.emit('test', 'hello')
}, 2000);
//*/

//console.log(global.console)

function getStateLabel(level)
{
    return level === 0 ? 'closed' : 'open';
}

function emitDoorState(level)
{
    let state = getStateLabel(level);

    console.log(`door ${state}`);
    socket.emit('test', `door ${state}`);
}


let pins = {
    doorSensor: 17
};


console.log('open gpio');

const doorSensor = new Gpio(pins.doorSensor, 
{
    mode: Gpio.INPUT,
    pullUpDown: Gpio.PUD_UP,
    alert: true
});
doorSensor.glitchFilter(10000);                                 // microsecond (1/1000000th) - 10,000 microseconds === 0.01s

doorSensor.on('alert', (level, tick) => 
{
    emitDoorState(level);
});

socket.on("connect", () => 
{
    console.log("socket.connected");
    let level = doorSensor.digitalRead();
    emitDoorState(level);
});

socket.on("disconnect", () => console.log("socket.disconnected"));  