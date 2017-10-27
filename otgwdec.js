module.exports = function(RED) {
    function popcount(x)
    {
    	var mask = 1, count = 0;
    	while (mask)
      {
    		if (x & mask) count++;
    		mask <<= 1;
    	}
    	return count;
    }

    function OTGWDec(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        this.on('input', function(msg) {
            var raw = msg.payload.toString().toUpperCase();

            // Perform sanity check on message
            // Length should by message type + 8 hex characters
            if (raw.length != 9)
            {
              node.warn("Illegal message length '"+raw+"'");
              return;
            }

            const M_THERMOSTAT = 0;
            const M_BOILER = 1;
            const M_REQ_BOILER = 2;
            const M_RSP_THERMOSTAT = 3;
            const msgMap = {"T": M_THERMOSTAT, "B": M_BOILER, "R": M_REQ_BOILER, "A": M_RSP_THERMOSTAT};

            // Get type and validate
            var type = raw.charAt(0);
            if (-1 == Object.keys(msgMap).indexOf(type))
            {
              node.warn("Illegal message type '"+raw+"'");
              return;
            }
            // Extract message and validate it's hex
            var message = raw.slice(1);
            var hexregex = /[0-9A-F]+/g;
            if(! hexregex.test(message))
            {
              node.warn("Illegal message content '"+raw+"'");
              return;
            }
            // Verify parity -- The parity bit should be set or cleared such the
            // total number of '1' bits in the entire 32 bits of the message is even.
            if (popcount(parseInt(message, 16)) % 2 != 0)
            {
              node.warn("Illegal message parity '"+raw+"'");
              return;
            }
            // Extract values
            msg.msgtype   = (parseInt(message.slice(0,2), 16) & 0x70) >> 4;
            msg.dataid    = parseInt(message.slice(2,4), 16);
            msg.datavalue = parseInt(message.slice(4,8), 16);
            node.send(msg);
        });
    }
    RED.nodes.registerType("otgwdec",OTGWDec);
}
