import React from 'react'
import { Link } from 'react-router-dom'
import styles from './welcome.module.scss'

const Welcome = () => (
  <div className={styles.container}>
    <div className={styles.banner}>
      <img src="logo.png" alt="logo" className={styles.logo} />
      <div className={styles.slogan}>
        <span>Welcome to Keypering</span>
      </div>
    </div>
    <div className={styles.navs}>
      <Link to="/create_wallet/create">Create a Wallet</Link>
      <Link to="/create_wallet/import">Import Wallet Seed</Link>
      <Link to="/import_keystore">Import from Keystore</Link>
    </div>
  </div>
)

export default Welcome
