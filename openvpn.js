
var net = require('net');
var client = new net.Socket();

var client_buffer="";
var client_failed_reason="";

var client_state="";
var client_bytesIn=0;
var client_bytesOut=0;
var client_localip="";
var client_remoteip="";

var client_hold=0;

client.connect(10000, '127.0.0.1', function() {
});

client.on('data', function(data) {
  client_buffer+=data.toString();
  var endl_pos = client_buffer.indexOf('\n');

  while(endl_pos > -1) {
    var cur_str = client_buffer.slice(0,endl_pos);

    if(cur_str.slice(0,1) == '>') {
      var command = cur_str.slice(1,cur_str.indexOf(":"));
      var parameters = cur_str.replace(/(\r\n|\n|\r)/gm,"").slice(cur_str.indexOf(":")+1).split(",");

      switch(command) {
        case "BYTECOUNT":
            client_bytesIn=parameters[0];
            client_bytesOut=parameters[1];
            break;
        case "HOLD":
            client.write("hold release\n")
            break;
        case "INFO":
            client.write("state on\n");
            client.write("bytecount 1\n")
            break;
        case "PASSWORD":
            if(parameters[0].substr(0,parameters[0].indexOf(":"))=="Verification Failed") {
              client_failed_reason="Incorrect Password";
            }
            break;
        case "STATE":
            // timestamp
            // STATE
            // parameters
           switch(parameters[1]) {
             case "RESOLVE":
             case "WAIT":
             case "AUTH":
             case "GET_CONFIG":
               client_state=parameters[1];
               break;
             case "EXITING":
               client_state=parameters[1];
               if(client_failed_reason)
                 console.log("Failed Connect: "+client_failed_reason);
               else
                 console.log("Exiting");
               console.log("Transferred " + client_bytesIn + " in and " + client_bytesOut + " out")
               break;
             case "ASSIGN_IP":
               client_localip=parameters[3];
               break;
             case "ADD_ROUTES":
               break;
             case "CONNECTED":
               if(parameters[2]=="SUCCESS") {
                 client_localip=parameters[3];
                 client_remoteip=parameters[4];
                 console.log("Connected with IP " + client_localip + " and " + client_remoteip);
               }
               break;
           }
           break;
        default:
          console.log(command);
          console.log(parameters.toString());
          break;
      }

    }
    else {

    }
    client_buffer = client_buffer.slice(endl_pos+1);
    endl_pos = client_buffer.indexOf('\n');
  }

});

client.on('close', function() {

});
