import React, { useEffect, useState } from 'react'
import PageHeader from '../components/PageHeader'
import styles from './Notifications.module.css'

export default function Notifications() {

  const [notifications, setNotifications] = useState([])

  useEffect(() => {

    loadNotifications()

  }, [])

  const loadNotifications = async () => {

    try {

      const token = localStorage.getItem('token')

      const res =await fetch(`${API}/alerts/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const data = await res.json()

      if (res.ok) {
        setNotifications(data)
      } else {
        console.log(data.error)
      }

    } catch (err) {

      console.log(err)

    }

  }

  const deleteNotification = async (id) => {

    try {

      const token = localStorage.getItem('token')

      await fetch(`${API}/alerts/${id}`,

        {

          method: 'DELETE',

          headers: {

            Authorization: `Bearer ${token}`

          }

        }

      )

      loadNotifications()

    } catch (err) {

      console.log(err)

    }

  }

  return (

    <div>

      <PageHeader
        title="Notifications"
        subtitle={`${notifications.length} Active Alerts`}
      />

      {notifications.length === 0 ? (

        <div className={styles.empty}>

          <span style={{ fontSize: 48 }}>🎉</span>

          <p>All clear! No notifications.</p>

        </div>

      ) : (

        <div className={styles.list}>

          {notifications.map((n) => (

            <div
              key={n.alert_id}
              className={`${styles.item} glass`}
            >

              <span
                className={`${styles.dot}
                ${
                  n.type === 'warning'
                    ? styles.dotAmber
                    : n.type === 'action'
                    ? styles.dotAccent
                    : styles.dotTeal
                }`}
              />

              <div className={styles.content}>

                <h4
                  style={{
                    margin: 0,
                    fontWeight: 600
                  }}
                >
                  {n.title}
                </h4>

                <p className={styles.text}>
                  {n.message}
                </p>

                <p className={styles.time}>
                  {new Date(n.created_at).toLocaleString()}
                </p>

              </div>

              <button
                className={styles.dismiss}
                onClick={() => deleteNotification(n.alert_id)}
              >
                Delete
              </button>

            </div>

          ))}

        </div>

      )}

    </div>

  )

}