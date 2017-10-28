# OpenTherm interface for Node-RED

These nodes will decode messages from an [OpenTherm](https://www.opentherm.eu/) central heating system.

The decoded messages can be used to monitor your heating system or control other systems (e.g. switch floor heating pump on when the system is heating).
Currently only decoding of messages is implemented, so you cannot use it to control a heating system.

It has been developed & tested using an [OTGW](http://otgw.tclcode.com) gateway which has its own format of representing OpenTherm messages. A node is included to extract **msgtype**, **dataid** and **datavalue** from the OTGW output into regular OpenTherm data.
When using a different OpenTherm interface, just make sure the appropriate message properties are set and you're good to go!

## Topics
The OpenTherm standard (this decoder should be compatible with version 2.2) defines just a number of parameters without a clear structure or classification. I tried to group items into topics, e.g:

| OpenTherm     | Decoded topic |
| ------------- | ------------- |
| 0, HB, bit 0 - Master status CH enable | master/status/ch |
| 0, HB, bit 1 - Master status DHW enable | master/status/dhw |
| 0, LB, bit 0 - Slave status fualt indication | slave/status/fault |
| 16 - Room setpoint | room/setpoint |
| 124 - OpenTherm version Master | master/opentherm_version |
| 125 - OpenTherm version Slave  | slave/opentherm_version  |
| etc. | etc. |

For the complete list of topics refer to the [Map array](https://github.com/Yveaux/node-red-contrib-opentherm/blob/master/openthermdec.js#L42) in the code.

The topic/value output of the openthermdec node perfectly fits further processing with MQTT.

## Example
The following flow will read OpenTherm messages from an OTGW connected to a local serial port. If first decodes the messages, then filters on READ- and WRITE_ACK's. The messages that pass are converted to an opentherm topic and value. This output is written to a textual logfile for further analysis.

![Example-flow](https://raw.githubusercontent.com/Yveaux/node-red-contrib-opentherm/master/images/example-flow.png)

```
[{"id":"cb0827f2.488e4","type":"openthermdec","z":"9b23cf80.97f2f8","name":"","x":721,"y":365,"wires":[["c0dc8166.e91428","d7de2302.0eedb8"]]},{"id":"c0dc8166.e91428","type":"debug","z":"9b23cf80.97f2f8","name":"","active":false,"console":"false","complete":"true","x":891,"y":431,"wires":[]},{"id":"ffa96ab5.cff278","type":"otgwdec","z":"9b23cf80.97f2f8","name":"","x":246,"y":372,"wires":[["885646b3.e20638","5760a89d.6b68d8"]]},{"id":"885646b3.e20638","type":"debug","z":"9b23cf80.97f2f8","name":"","active":false,"console":"false","complete":"true","x":420,"y":437,"wires":[]},{"id":"ff05e901.906748","type":"file","z":"9b23cf80.97f2f8","name":"","filename":"/opentherm.log","appendNewline":true,"createDir":true,"overwriteFile":"false","x":1112,"y":367,"wires":[]},{"id":"d7de2302.0eedb8","type":"function","z":"9b23cf80.97f2f8","name":"To CSV","func":"msg.payload =         msg.raw\n              + \",\" + msg.msgtype\n              + \",\" + msg.dataid\n              + \",\" + msg.datavalue\n              + \",\" + msg.topic\n              + \",\" + msg.payload;\nreturn msg;","outputs":1,"noerr":0,"x":934,"y":367,"wires":[["ff05e901.906748"]]},{"id":"5760a89d.6b68d8","type":"switch","z":"9b23cf80.97f2f8","name":"read ack/write ack/else","property":"msgtype","propertyType":"msg","rules":[{"t":"eq","v":"4","vt":"num"},{"t":"eq","v":"5","vt":"num"},{"t":"else"}],"checkall":"true","outputs":3,"x":474,"y":372,"wires":[["cb0827f2.488e4"],["cb0827f2.488e4"],[]]},{"id":"5b74970a.24d1f8","type":"serial in","z":"9b23cf80.97f2f8","name":"","serial":"2987f07e.837b88","x":88,"y":373,"wires":[["ffa96ab5.cff278","f2911419.5696e8"]]},{"id":"f2911419.5696e8","type":"debug","z":"9b23cf80.97f2f8","name":"","active":false,"console":"false","complete":"false","x":222,"y":438,"wires":[]},{"id":"2987f07e.837b88","type":"serial-port","z":"","serialport":"/dev/ttyS0","serialbaud":"9600","databits":"8","parity":"none","stopbits":"1","newline":"\\n","bin":"false","out":"char","addchar":false}]
```
