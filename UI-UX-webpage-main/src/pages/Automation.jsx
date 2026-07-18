import React, { useEffect, useState } from "react";
import { API } from "../config";
import styles from "./Automation.module.css";
export default function Automation() {

  const user = JSON.parse(localStorage.getItem("smarthome_user"));

 const [rooms, setRooms] = useState([]);
const [appliances, setAppliances] = useState([]);
const [rules, setRules] = useState([]);
const [roomId, setRoomId] = useState("");
const [deviceId, setDeviceId] = useState("");

const [sensor, setSensor] = useState("Temperature");
const [condition, setCondition] = useState(">");
const [threshold, setThreshold] = useState("");
const [action, setAction] = useState("ON");


useEffect(() => {
    loadRooms();
     loadRules();
}, []);

useEffect(() => {

    if (roomId) {
        loadAppliances(roomId);
    }

}, [roomId]);
const loadRooms = async () => {

    try {

        const token = localStorage.getItem("token");

        const res = await fetch(`${API}/automation/rooms`, {

            headers: {
                Authorization: `Bearer ${token}`
            }

        });

        const data = await res.json();

        setRooms(data);

    } catch (err) {

        console.log(err);

    }

};

const loadAppliances = async (room) => {

    try {

        const token = localStorage.getItem("token");

        const res = await fetch(
            `${API}/automation/appliances/${room}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await res.json();

        setAppliances(data);

    } catch (err) {

        console.log(err);

    }

};
const loadRules = async () => {

    try {

        const token = localStorage.getItem("token");

        const res = await fetch(

            `${API}/automation`,

            {

                headers: {

                    Authorization: `Bearer ${token}`

                }

            }

        );
const data = await res.json();

console.log(data);

if (Array.isArray(data)) {
    setRules(data);
} else {
    setRules([]);
} 

    }

    catch(err){

        console.log(err);

    }

}

const deleteRule = async(id)=>{

try{

const token=localStorage.getItem("token")

await fetch(

`${API}/automation/${id}`,

{

method:"DELETE",

headers:{

Authorization:`Bearer ${token}`

}

}

)

loadRules()

}

catch(err){

console.log(err)

}

}

  const createRule = async () => {

    try {

      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/automation`, {

        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },

        body: JSON.stringify({
          user_id: user.userId,
          room_id: roomId,
          sensor,
          condition,
          threshold,
          device_id: deviceId,
          action
        })

      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error);
        return;
      }

      alert("Automation Rule Created Successfully ✅");
      loadRules();

      setRoomId("");
      setSensor("");
      setCondition(">");
      setThreshold("");
      setDeviceId("");
      setAction("ON");

      console.log(data);

    } catch (err) {

      console.log(err);
      alert("Server Error");

    }

  };

  return (

   <div className={styles.container}>

      <h1 className={styles.title}>
  Automation Rules
</h1>

      <div className={styles.card}>

        <select
        className={styles.select}
  value={roomId}
  onChange={(e) => {
    setRoomId(e.target.value);
    setDeviceId("");
  }}
>

  <option value="">Select Room</option>

  {rooms.map(room => (

    <option
      key={room.room_id}
      value={room.room_id}
    >
      {room.room_name}
    </option>

  ))}

</select>

        <select
        className={styles.select}
  value={sensor}
  onChange={(e) => setSensor(e.target.value)}
>

  <option>Temperature</option>
  <option>Humidity</option>
  <option>Motion</option>
  <option>Gas</option>
  <option>Water Level</option>
  <option>LDR</option>

</select>

        <select
        className={styles.select}
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
        >
          <option>{">"}</option>
          <option>{"<"}</option>
          <option>{"="}</option>
        </select>

       <select
  className={styles.select}
  value={threshold}
  onChange={(e) => setThreshold(e.target.value)}
>
  <option value="">Select Threshold</option>

  {(sensor === "Temperature"
    ? Array.from({ length: 71 }, (_, i) => i)
    : sensor === "Humidity"
    ? Array.from({ length: 101 }, (_, i) => i)
    : sensor === "Water Level"
    ? Array.from({ length: 101 }, (_, i) => i)
    : sensor === "Gas"
    ? [100, 200, 300, 400, 500, 600, 700, 800]
    : sensor === "LDR"
    ? [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]
    : [0, 1]
  ).map((value) => (
    <option key={value} value={value}>
      {value}
    </option>
  ))}
</select>

       <select
       className={styles.select}
  value={deviceId}
  onChange={(e) => setDeviceId(e.target.value)}
>

  <option value="">Select Appliance</option>

  {appliances.map(device => (

    <option
      key={device.appliance_id}
      value={device.appliance_id}
    >
      {device.appliance_name}
    </option>

  ))}

</select>
        <select
        className={styles.select}
          value={action}
          onChange={(e) => setAction(e.target.value)}
        >
          <option>ON</option>
          <option>OFF</option>
        </select>

       <button
  className={styles.saveBtn}
  onClick={createRule}
>
  Save Automation Rule
</button>

<div className={styles.rules}>

  <h2>Saved Automation Rules</h2>

  {rules.length === 0 ? (

    <p>No automation rules created.</p>

  ) : (

    rules.map((rule) => (

      <div
        key={rule.id}
        className={styles.ruleCard}
      >

        <div className={styles.ruleTop}>

          <div className={styles.ruleTitle}>
            {rule.sensor} {rule.condition} {rule.threshold}
          </div>

        </div>

        <div className={styles.ruleText}>
          📍 {rule.room_name}
        </div>

        <div className={styles.ruleText}>
          💡 {rule.appliance_name}
        </div>

        <div className={styles.ruleText}>
          ⚡ Action : {rule.action}
        </div>

        <div className={styles.actions}>

          <button className={styles.editBtn}>
            Edit
          </button>

          <button
            className={styles.deleteBtn}
            onClick={() => deleteRule(rule.id)}
          >
            Delete
          </button>

        </div>

      </div>

    ))

  )}

</div>

</div>

</div>
  );
}
