import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Axios from "axios" //Axios에 {Axios}하면 오류 뜬다. 중괄호는 export default axios; 같은 경우만 하는 것
import { AuthProvider } from '@/context/auth'
import { useRouter } from 'next/router';
import NavBar from '@/components/NavBar';
import { SWRConfig } from 'swr';
import axios from 'axios';
import Head from 'next/head';


export default function App({ Component, pageProps }: AppProps) {

  //로그인페이지와 회원가입 페이지는 네비게이션바가 안보이게 하기위해 미리지정한다.
  //userRouter을 이용해 현재 path를 가져온다
  const {pathname}= useRouter();
  const authRoutepath=["/login","/register"];
  const authRoute=authRoutepath.includes(pathname);

  
  //NEXT_REPUBLIC_SERVER_BASE_URL 환경변수임
  //process.env는 환경변수 접근, process는 import없이 어디에서든 사용 가능
  //Axios.defaults.baseURL : Axios 전역 설정 -> 모든 요청에 적용되는 설정의 default 값을 전역으로 명시할 수 있다.
  Axios.defaults.baseURL= process.env.NEXT_PUBLIC_SERVER_BASE_URL + "/api"
  
  //모든 axios요청에 withCredentials :true 옵션을 준다. -> 쿠키를 서버에 전송하기 위해
  Axios.defaults.withCredentials = true;


  const fetcher = async(url: string)=>{
      try {
          const res = await axios.get(url);
          return res.data;
          
      } catch (error) {
          console.log(error);
      }
    
  }

  //{!authRoute && <NavBar/>} 이용해 authRoute가 true면 로그인페이지,회원가입페이지니까 안보여주고, false면 뒤에 NavBar가 보여진다. 네비게이션바를 보여줄지 말지를 정하고
  //따로 pt-12를 줄지 말지를 정해서 윗 공간을 비워 놓는다. 네이게이션바가 있으면(authRoute가 flase) 띄워놓아야 첫번째 포스트가 보이니까

  //Authprovider : context 사용을 위해 감싸줌
  //SWRConfig : useSWR을 사용할 때 불필요하게 fetch함수를 계속해서 작성해야했다. 이를 간단하게 하기위해 SWRConfig을 사용하여 간단하게 이용
  //Head : nextJS에서 제공하는 head사용 - ICON font-awesome 사용하기위해
  //<script defer src="https://use.fontawesome.com/releases/v5.15.4/js/all.js" integrity="sha384-rOA1PnstxnOBLzCLMcre8ybwbTmemjzdNlILg8O7z1lUkLXozs4DHonlDtnE7fpc" crossorigin="anonymous"></script> 삽입
  //crossorigin은 JSX에서는 crossOrigin으로 바꿔줘야한다.
  return (
    <Head >
      <script defer src="https://use.fontawesome.com/releases/v5.15.4/js/all.js" integrity="sha384-rOA1PnstxnOBLzCLMcre8ybwbTmemjzdNlILg8O7z1lUkLXozs4DHonlDtnE7fpc" crossOrigin="anonymous"></script>
      <SWRConfig
      value={{fetcher}}
    >
        <AuthProvider>
        {!authRoute && <NavBar/>}
          <div className={authRoute ? "" : "pt-16"}>
            <Component {...pageProps} />
          </div>
        
        </AuthProvider>
      </SWRConfig>
    
    </Head>
    
    
  )
  
}
