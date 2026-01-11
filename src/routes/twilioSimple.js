const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/twilio/voice - Simple endpoint that connects directly to ElevenLabs Otto
router.post("/voice", async (req, res) => {
  try {
    const { From, To, CallSid } = req.body;
    console.log("Incoming call to Otto:", { From, To, CallSid });

    // Log call to database (simple version)
    try {
      // Look up customer by phone number
      const customer = await prisma.customer.findFirst({
        where: { phone: From },
      });

      // Create call record
      if (customer) {
        await prisma.call.create({
          data: {
            direction: "INBOUND",
            status: "RINGING",
            outcome: "Otto AI Agent",
            startedAt: new Date(),
            customerId: customer.id,
            notes: `Twilio CallSid: ${CallSid}`,
          },
        });
      }
    } catch (dbError) {
      console.error("Database error (non-fatal):", dbError);
      // Continue even if database fails
    }

    // Generate TwiML that connects to backend media stream (which handles ElevenLabs)
    const twilio = require("twilio");
    const twiml = new twilio.twiml.VoiceResponse();

    // Get the host from environment or request
    const host =
      process.env.BASE_URL?.replace("https://", "").replace("http://", "") ||
      req.get("host");
    const wsProtocol = process.env.NODE_ENV === "production" ? "wss" : "ws";

    // Connect to local media stream handler (bidirectional)
    const connect = twiml.connect();
    const stream = connect.stream({
      url: `${wsProtocol}://${host}/api/twilio/media-stream`,
    });

    res.type("text/xml");
    res.send(twiml.toString());
  } catch (error) {
    console.error("Error connecting to Otto:", error);

    // Fallback
    const twilio = require("twilio");
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say(
      "Hello, this is Caipher. We are experiencing technical difficulties. Please call back shortly."
    );

    res.type("text/xml");
    res.send(twiml.toString());
  }
});

module.exports = router;
