import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Axios from "axios" //Axios에 {Axios}하면 오류 뜬다. 중괄호는 export default axios; 같은 경우만 하는 것

export default function App({ Component, pageProps }: AppProps) {
  //NEXT_REPUBLIC_SERVER_BASE_URL 환경변수임
  //process.env는 환경변수 접근, process는 import없이 어디에서든 사용 가능
  //Axios.defaults.baseURL : Axios 전역 설정 -> 모든 요청에 적용되는 설정의 default 값을 전역으로 명시할 수 있다.
  Axios.defaults.baseURL= process.env.NEXT_PUBLIC_SERVER_BASE_URL + "/api"
  
  return <Component {...pageProps} />
}
