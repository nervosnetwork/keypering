import { InvalidJsonRpcRequestException } from '../exception'
export const validateJsonRpcFields = (params: any) => {
  if ([params?.id, params?.method].some(field => field === undefined || field === null) || params?.jsonrpc !== '2.0') {
    throw new InvalidJsonRpcRequestException()
  }
}
