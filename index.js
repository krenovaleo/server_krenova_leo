// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);



var msgService = require("firebase-admin/messaging")
var express = require("express")
// var cors = require('cors')
var admin = require("firebase-admin")
var app = express()

// app.use(
//   cors({
//     origin: "*",
//   })
// );

// app.use(
//   cors({
//     methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
//   })
// );

app.use(function (req, res, next) {
  res.setHeader("Content-Type", "application/json");
  next();
});

app.get('/', function (req, res) {
  res.send({ title: 'KRENOVA_4S_SERVER' });
});

var serviceAccount = require("./safetystove-3ff9e-firebase-adminsdk-kwn5x-f69ce1f17e.json")

const firebaseConfig = {
  apiKey: "AIzaSyDzZuxbLVAW7bkMNPSdvlgoLhM2JvyuY88",
  authDomain: "safetystove-3ff9e.firebaseapp.com",
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://safetystove-3ff9e-default-rtdb.firebaseio.com",
  projectId: "safetystove-3ff9e",
  storageBucket: "safetystove-3ff9e.appspot.com",
  messagingSenderId: "11558714996",
  appId: "1:11558714996:web:a1cffc71aae4d1858cdb21",
  measurementId: "G-RFXB7K5BBC"
};

admin.initializeApp(firebaseConfig);

app.post("/send", function (req, res) {
  res.send({ title: 'send api' });
  admin.database().ref('stove').on('value', (sn) => {
    sn.forEach(async (st) => {
      const data = st.val()
      console.log(data)
      if (data.isRunning) {
        await sendNotification(data.fcmToken, data.isRunning)
        console.log('stove is running')
      } else {
        await sendNotification(data.fcmToken, data.isRunning)
        console.log('stove is not running')
      }
    })
  })


});

function toStringFromInt(inp) {
  switch(inp){
    case 1:
      return "1 minutes"
      // break;
      case 5:
        return "5 minutes"
        // break;
        case 10:
          return "10 minutes"
          // break;
          case 60:
            return "1 hours"
            // break;
            default:
              return "1 min"
  }
}

async function notifConditioning(notifSwitch, timeOff, token) {
  const messageRunning = {
    notification: {
      title: "Stove is Safety",
      body: 'get close with your app'
    },
    token: token,
  };

  const messageNotRunning = {
    notification: {
      title: "Stove is not running",
      body: 'manage your stove setup it can be more safety'
    },
    token: token,
  }

  const messageTimeOn = {
    notification: {
      title: "Time Safety is Started",
      body: `${toStringFromInt(timeOff)} before your stove will turning off`
    },
    token: token
  }
  const messageTimeOff = {
    notification: {
      title: "Time Safety is completed",
      body: `${toStringFromInt(timeOff)} before your stove will turning off`
    },
    token: token
  }
  switch (notifSwitch) {
    case 1: // notif for running stove
      await notifAvailable(messageRunning)
      console.log(" notification 1")
      break
    case 2: // notif for off stove
      await notifAvailable(messageNotRunning)
      console.log(" notification 2")
      break
    case 3: // notif for time event conditon
      await notifAvailable(messageTimeOn)
      console.log("notification 3")
      break
      case 4:
        console.log("notification 4")
        await notifAvailable(messageTimeOff)
        break
    default:
      console.log("default")
  }
}


// const ref = db.ref(`stove`)
admin.database().ref('stove').on('value', (sn) => {
  sn.forEach(async (st) => {
    const data = st.val()
    notifConditioning(data.notifCondition, data.timeOff, data.fcmToken)
  })
})


async function notifAvailable(theMsg) {
  await msgService.getMessaging().send(theMsg)
    .then((response) => {
      console.log(response)
      console.log("Successfully sent message:", response);
    })
    .catch((error) => {
      console.log("Error sending message:", error);
    });
}


var server = app.listen(3000, function () {
  console.log(server.address())
  console.log("Notification Server Start on port 3000");
});


