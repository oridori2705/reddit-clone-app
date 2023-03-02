import { Sub } from "@/types";
import axios from "axios";
import Link from "next/link";
import useSWR from "swr";

 
export default function Home() {

  //swr을 위한 fetcher와 address 지정
    //address가 fetcher의 url에 지정 -> axios요청 -> 반환된 값은 swr의 topSubs로
    const fetcher = async (url: string) => {
      return await axios.get(url).then(res => res.data)//여기서 반환된 res는 아래에 topSubs로 간다
    }
    const address = `/subs/sub/topSubs`;

  //커뮤니티리스트를 가져오기위한 SWR 사용 - 모듈설치해야함
    const { data: topSubs } = useSWR<Sub[]>(address, fetcher)

  return (
    <div className='flex max-w-5xl px-4 pt-5 mx-auto'>
      ddd
    {/* 포스트 리스트 */}
    <div className='w-full md:mr-3 md:w-8/12'>
      

    </div>

    {/* 사이드바 */}
    <div className='hidden w-4/12 ml-3 md:block'>
      <div className='bg-white border rounded'>
        <div className='p-4 border-b'>
          <p className='text-lg font-semibold text-center'>상위 커뮤니티</p>
        </div>

        {/* 커뮤니티 리스트 */}
        <div>


        </div>
        
        <div className='w-full py-6 text-center'>
          <Link href="/subs/create">
            <p className='w-full p-2 text-center text-white bg-gray-400 rounded'>
              커뮤니티 만들기
            </p>
          </Link>
        </div>
        
      </div>
    </div>




  </div>
  )
}
