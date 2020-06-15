export default class Storage {
  getSalt = () => {};

  setItem = (key: string, value: any) => {
    window.localStorage.setItem(key, value);
  };

  getItem = (key: string) => {
    return window.localStorage.getItem(key);
  };

  theSalt: string = "SALTME!";

  get salt() {
    return this.theSalt;
  }

  set salt(_salt: string) {
    this.theSalt = _salt;
  }

  set currentWalletName(walletName: string) {
    this.setItem("currentWalletName", walletName);
  }

  get currentWalletName() {
    return this.getItem("currentWalletName") || "";
  }

  getWallets = () => {
    const walletsJSON = this.getItem("wallets");
    if (!walletsJSON) {
      return [];
    }
    const wallets = JSON.parse(walletsJSON);
    return wallets;
  };

  getWalletByName = (walletName: string) => {
    const wallets = this.getWallets();
    return wallets.find((w: any) => w.name === walletName);
  };

  addWallet = (walletName: string, wallet: any) => {
    const wallets = this.getWallets();
    const index = wallets.findIndex((w: any) => w.name === walletName);
    if (index === -1) {
      const newWallet = Object.assign(wallet, { name: walletName });
      wallets.push(newWallet);
    } else {
      const newWallet = Object.assign(wallet, { name: walletName });
      wallets[index] = newWallet;
    }
    this.setItem("wallets", JSON.stringify(wallets));
    return wallets;
  };

  removeWallet = (walletName: string) => {
    let wallets = this.getWallets();
    const index = wallets.findIndex((wallet: any) => wallet.name === walletName);
    if (index === -1) {
      return wallets;
    }
    wallets = wallets.splice(index, 1);
    this.setItem("wallets", JSON.stringify(wallets));
    return wallets;
  };

  set request(_request: any) {
    this.setItem("request", JSON.stringify(_request));
  }

  get request() {
    const request = this.getItem("request");
    if (!request) {
      return null;
    }
    return JSON.parse(request);
  }

  get authorizations() {
    const auths = this.getItem("authorizations");
    if (!auths) {
      return [];
    }

    return JSON.parse(auths);
  }

  listAuthorization = () => {
    return this.authorizations;
  };

  removeAuthorization = (token: string) => {
    const auths = this.authorizations;
    const index = auths.findIndex((auth: any) => auth.token === token);
    if (index === -1) {
      return auths;
    }
    auths.splice(index, 1);
    this.setItem("authorizations", JSON.stringify(auths));
    return auths;
  };

  addAuthorization = (auth: any) => {
    const auths = this.authorizations;
    const index = auths.findIndex((_auth: any) => _auth.token === auth.token);
    if (index !== -1) {
      auths.splice(index, 1);
    }
    auths.unshift(auth);
    this.setItem("authorizations", JSON.stringify(auths));
    return auths;
  };

  static defaultStorage = new Storage();

  static getStorage = () => {
    return Storage.defaultStorage;
  };
}
