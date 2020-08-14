import { KeyperingAgency } from '@keypering/specs'

export class UnsupportedCipherException extends Error {
  constructor() {
    super(`Unsupported cipher`)
  }
}

export class IncorrectPasswordException extends Error {
  constructor() {
    super(`Password is incorrect`)
  }
}

export class InvalidKeystoreException extends Error {
  constructor() {
    super(`Keystore is invalid`)
  }
}

export class InvalidMnemonicException extends Error {
  constructor() {
    super(`Mnemonic is invalid`)
  }
}

export class WalletNotFoundException extends Error {
  constructor() {
    super(`Wallet not found`)
  }
}

export class CurrentWalletNotSetException extends Error {
  constructor() {
    super(`Current wallet is not set`)
  }
}

export class ParamsRequiredException extends Error {
  constructor(fieldName: string) {
    super(`${fieldName} is required`)
  }
}

export class AuthNotFoundException extends Error {
  constructor() {
    super(`Authorization is not found`)
  }
}

export class MethodNotFoundException extends Error {
  code = 404
  constructor(method: string) {
    super(`Method ${method} is not found`)
  }
}
export class InvalidJsonRpcRequestException extends Error {
  code = 400
  constructor() {
    super(`Invalid jsonrpc request`)
  }
}

export class AuthRejected extends Error {
  code = KeyperingAgency.Code.Rejected
  constructor() {
    super(`Authorization request is rejected`)
  }
}

export class RequestRejected extends Error {
  code = KeyperingAgency.Code.Rejected
  constructor() {
    super(`Request of signing transaction is rejected`)
  }
}

export class FileNotFoundException extends Error {
  constructor() {
    super(`File is not found`)
  }
}

export class RemoveFileFailed extends Error {
  constructor() {
    super(`Failed to remove wallet keystore`)
  }
}

export class NetworkNotFoundException extends Error {
  constructor() {
    super(`Network is not found`)
  }
}

export class RequestPasswordRejected extends Error {
  code = KeyperingAgency.Code.Rejected
  constructor() {
    super(`Request of inputting password is rejected`)
  }
}

export class DirectoryNotFound extends Error {
  code = KeyperingAgency.Code.Rejected
  constructor() {
    super(`Directory or file are not found`)
  }
}

export class InvalidTokenException extends Error {
  code = KeyperingAgency.Code.InvalidToken
  constructor() {
    super(`Invalid token, please check authorization`)
  }
}

export class InvalidDirectoryException extends Error {
  constructor(name: string) {
    super(`${name} is not a directory`)
  }
}

export class LockNotFoundException extends Error {
  constructor() {
    super(`Lock is not found`)
  }
}
