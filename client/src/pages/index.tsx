import { Post, Sub } from "@/types";
import axios from "axios";
import Link from "next/link";
import useSWR from "swr";
import Image from 'next/image'
import { useAuthState } from "@/context/auth";
import useSWRInfinite from "swr/infinite"; //useSWRInfinite사용하기위해 수동으로 import
import PostCard from "@/components/PostCard";
import { useEffect, useState } from "react";



export default function Home() {
  const { authenticated } = useAuthState();
  //swr을 위한 fetcher와 address 지정
  //address가 fetcher의 url에 지정 -> axios요청 -> 반환된 값은 swr의 topSubs로
    const fetcher = async (url: string) => {
      return await axios.get(url).then(res => res.data)//여기서 반환된 res는 아래에 topSubs로 간다
    }
    const address = `/subs/sub/topSubs`;

  //커뮤니티리스트를 가져오기위한 SWR 사용 - 모듈설치해야함
  const { data: topSubs } = useSWR<Sub[]>(address, fetcher) //여기 fetcher부분은 안지웟음 다른 fetcher와 달라서






  //메인페이지에 Post 나열하기
  //getkey는 useSWRInfinite를 사용하기 위한 메소드임
  //pageIndex는 현재 페이지를 의미 -> 스크롤하면서 8개면 8개마다 1페이지이다.
  const getKey = (pageIndex: number, previousPageData: Post[]) => {
    //previousPageData는 이전의 페이지 배열을 넣는 것인데 previousPageData에는 이전의 요청에 가져온 Post들이 들어있는데
    //이게 비어있으면 이전의 요청에서는 이제 가져올 Post가 없는 것을 의미
    if (previousPageData && !previousPageData.length) return null;
    //pageIndex는 useSWRInfinite에서 지정해준 page로 지정된다.
    //routes/posts에 요청
    return `/posts?page=${pageIndex}`;
  }
  const { data, error, size: page, setSize: setPage, isValidating, mutate } = useSWRInfinite<Post[]>(getKey);

  //포스트리스트를 나열하기 위해서 먼저 가져올 Post가 존재하고 에러가 없으면 로딩중인것을 알리기위한 컴포넌트를 위해 분기 생성
  const isInitialLoading = !data && !error;
  //useSWRInfinite로 가져온 data가 처음에는 없으면 빈 배열로
  //요청으로 가져오면 8개씩 가져오는데 스클롤을 다 내렸을 때 다음 Post 8개는 배열에 추가되어야 하기 때문에 concat로 배열을 합침
  //as Post[]타입 지정해줘야함
  const posts: Post[] = data ? ([] as Post[]).concat(...data) : [];


  //무한스크롤은 위한 Intersection observer 사용
  //가져올 Post가 없을 경우에 observe 수행을 그만하기 위해 조건이 필요
  //그것을 위해 observedPost를 생성 -> 이전의 요청에서 가져온 Post의 마지막 배열의 id를 가지고 있음
  //나중에 새로가져온 Post의 마지막 배열의 id와 같으면 이제 Post가 없는 거니까 관찰요청 종료
  const [observedPost, setObservedPost] = useState("");

  useEffect(() => {
    // 포스트가 없다면 return 
    if (!posts || posts.length === 0) return;
    // posts 배열안에 마지막 post에 id를 가져옵니다.
    const id = posts[posts.length - 1].identifier;
    // posts 배열에 post가 추가돼서 마지막 post가 바뀌었다면
    // 바뀐 post 중 마지막post를 obsevedPost로 
    if (id !== observedPost) { //같지않으면 아직 새로 가져온 Post가 있는 거니까
      setObservedPost(id);
      observeElement(document.getElementById(id)); //마지막 Post를 DOM element로 보냄
    }
  }, [posts])
  
  //관찰하기위한 함수 observeElement
  const observeElement = (element: HTMLElement | null) => {
    if (!element) return;
    // 브라우저 뷰포트(ViewPort)와 설정한 요소(Element)의 교차점을 관찰
    const observer = new IntersectionObserver(
      // entries는 IntersectionObserverEntry 인스턴스의 배열
      (entries) => {
        // isIntersecting: 관찰 대상의 교차 상태(Boolean)
        if (entries[0].isIntersecting === true) { //만약 관찰중인 element(Post배열의 마지막 post)가 교차되면
          console.log("마지막 포스트에 왔습니다.");
          setPage(page + 1); //setPage를 통해 useSWRInfinite 호출
          observer.unobserve(element); //관촬중인 Element 없앰
        }
      },
      {threshold: 1}
    );
    // 대상 요소의 관찰을 시작
    observer.observe(element);
  }






  return (
    <div className='flex max-w-5xl px-4 pt-5 mx-auto'>
    {/* 포스트 리스트 */}
    <div className='w-full md:mr-3 md:w-8/12'>
      {isInitialLoading && <p className="text-lg text-center">로딩중입니다...</p>}
        {posts?.map(post => (
          <PostCard
            key={post.identifier}
            post={post}
            mutate={mutate}
          />
        ))}

    </div>

    {/* 사이드바 */}
    <div className='hidden w-4/12 ml-3 md:block'>
      <div className='bg-white border rounded'>
        <div className='p-4 border-b'>
          <p className='text-lg font-semibold text-center'>상위 커뮤니티</p>
        </div>

        {/* 커뮤니티 리스트 */}
        <div>
          {topSubs?.map((sub) => (
              <div
                key={sub.name}
                className="flex items-center px-4 py-2 text-xs border-b"
              >
                <Link href={`/r/${sub.name}`}>
                  <p>
                    <Image
                      src={sub.imageUrl}
                      className="rounded-full cursor-pointer"
                      alt="Sub"
                      width={24}
                      height={24}
                    />
                  </p>
                </Link>
                <Link href={`/r/${sub.name}`}>
                  <p className='ml-2 font-bold hover:cursor-pointer'>
                    /r/{sub.name}
                  </p>
                </Link>
                <p className='ml-auto font-md'>{sub.postCount}</p>
              </div>
            ))}

        </div>
        
        
        {authenticated &&
            <div className='w-full py-6 text-center'>
              <Link href="/subs/create">
                <p className='w-full p-2 text-center text-white bg-gray-400 rounded'>
                  커뮤니티 만들기
                </p>
              </Link>
            </div>
          }
        
        
      </div>
    </div>




  </div>
  )
}
