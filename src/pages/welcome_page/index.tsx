import React from "react";
import { Button, Icon, WhiteSpace } from "antd-mobile";
import { useHistory } from "react-router";
import styles from "./welcome.module.scss";
import Page from "../../widgets/page";

const WelcomePage = () => {
  const history = useHistory();
  return (
    <Page>
      <div className={styles.info}>
        <img src="logo.png" alt="logo" className={styles.logo} />
        <div className={styles.words}>Welcome to Keypering</div>
      </div>
      <div className={styles.ops}>
        <Button type="primary" onClick={() => history.push("/create_wallet")}>
          Create a Wallet
        </Button>
        <WhiteSpace />
        <Button>Import Wallet Seed</Button>
        <WhiteSpace />
        <Button>Import from Keystore</Button>
      </div>
      <div className={styles.statusContainer}>
        <Icon type="check-circle" size="xxs" color="#3cc68a" />
        &nbsp;
        <span className={styles.status}>Connected (mainnet)</span>
      </div>
    </Page>
  );
};

export default WelcomePage;
