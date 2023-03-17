import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router"
import useSWR from 'swr';
import { Comment, Post } from "../../../../types";
import dayjs from 'dayjs';
import { useAuthState } from "../../../../context/auth";
import { FormEvent, useState } from "react";
import classNames from 'classnames'; //좋아요 싫어요 화살표 아이콘 사용의 조건을 위해 
import { FaArrowUp, FaArrowDown } from "react-icons/fa"; //npm install react-icons --save 설치

const PostPage = () => {
    const { authenticated, user } = useAuthState(); //댓글 창을 위해 가져옴
    const [newComment, setNewComment] = useState(""); //댓글작성텍스트 값 저장
    
      
    //원래 useSWR은 아래와 같이 사용했다
    //post의 데이터를 가져오기위해 작성
    // const fetcher = async(url: string)=>{
    //     try {
    //         const res = await axios.get(url);
    //         return res.data;
            
    //     } catch (error) {
    //         console.log(error);
    //     }
       
    // }
    // const router = useRouter();
    // const subName = router.query.sub; //요청을 불러올 주소를 현재 라우터를 통해 저장,sub은 현재 url 이름, 만약 커뮤니티 이름이 test2면 test2를 가져옴
    // const { data: post, error } = useSWR<Post>(identifier && slug ? `/posts/${identifier}/${slug}` : null); //useSWR을 통해 서버에 데이터 요청
    
    const router = useRouter();
    const { identifier, sub, slug } = router.query; //router.query를 통해 현재 post의 경로를 데이터로 가져올 수 있다.
    //현재 클릭한 post정보를 가져온다.
    const { data: post, error,mutate: postMutate} = useSWR<Post>(identifier && slug ? `/posts/${identifier}/${slug}` : null);
    //post 아래 작성된 댓글들의 댓글 리스트들을 가져온다.
    const { data: comments,mutate: commentMutate } = useSWR<Comment[]>(
        identifier && slug ? `/posts/${identifier}/${slug}/comments` : null
    )
    //댓글이든 Post든 투표를 하게되면
    const vote = async (value: number, comment?:Comment) => {
        if(!authenticated) router.push("/login"); //로그인이 안되어 있다면 로그인 페이지로

        // 이미 클릭 한 vote 버튼을 눌렀을 시에는 reset
        if (
            (!comment && value === post?.userVote) ||//post의 투표 값이 있으면, (post를 무조건 가져오긴하지만 post에 undefined가 뜬다. ?를 줘서 없애자)
            (comment && comment.userVote === value) //댓글의 투표 값이 있으면
        ) {
            value = 0 //value를 0으로 만든다.
        }
        
        try {
            const res=await axios.post("/votes", {
                identifier, // 원래는 identifier : identifier인데 생략
                slug,
                commentIdentifier: comment?.identifier,
                value
            })//현재 response에는 post정보가 넣어져있음
            postMutate();
            commentMutate();
            console.log("res",res);
        } catch (error) {
            console.log(error);
        }
        
    }

    //댓글 작성버튼 누르면
    const handleSubmit= async (e:FormEvent)=>{
        e.preventDefault();
        if(newComment.trim() === ""){ //값이 없으면 막기
            return;
        }
        try {
            await axios.post(`/posts/${post?.identifier}/${post?.slug}/comments`,{ //서버으 routes로 comment 핸들러 요청
                body:newComment //body에 newComment로 설정  
            });
            commentMutate();
            setNewComment("");
        } catch (error) {
            console.log(error);   
        }
    }
    return (
        <div className="flex max-w-5xl px-4 pt-5 mx-auto">
            <div className="w-full md:mr-3 md:w-8/12">
                <div className="bg-white rounded">
                    {post && (
                        <div>
                            <div className="flex">
                                {/* 좋아요 싫어요 기능 부분 */}
                                <div className="flex-shrink-0 w-10 py-2 text-center rounded-l">
                                    {/* 좋아요 onClick={() => vote(1) 클릭했을 때 1을 올려줌 */ }
                                    <div
                                        className="flex justify-center w-6 mx-auto text-gray-400 rounded cursor-pointer hover:bg-gray-300 hover:text-red-500"
                                        onClick={() => vote(1)}
                                    >
                                        {post.userVote === 1 ?
                                            <FaArrowUp className="text-red-500" />
                                            : <FaArrowUp />
                                        }
                                    </div>
                                    {/*총 투표 수 */}
                                    <p className="text-xs font-bold">{post.voteScore}</p>
                                    {/* 싫어요 */}
                                    <div
                                        className="flex justify-center w-6 mx-auto text-gray-400 rounded cursor-pointer hover:bg-gray-300 hover:text-blue-500"
                                        onClick={() => vote(-1)}
                                    >
                                        {post.userVote === -1 ?
                                            <FaArrowDown className="text-blue-500" />
                                            : <FaArrowDown />
                                        }
                                    </div>
                                </div>
                                <div className="py-2 pr-2">
                                    <div className="flex items-center">
                                        <p className="text-xs test-gray-400">
                                            Posted by<i className="fas fa-abacus"></i>

                                            <Link href={`/u/${post.username}`}>
                                                <p className="mx-1 hover:underline">
                                                    /u/{post.username}
                                                </p>
                                            </Link>
                                            <Link href={post.url}>
                                                <p className="mx-1 hover:underline">
                                                    {dayjs(post.createdAt).format("YYYY-MM-DD HH:mm")}
                                                </p>
                                            </Link>
                                        </p>
                                    </div>
                                    <h1 className="my-1 text-xl font-medium">{post.title}</h1>
                                    <p className="my-3 text-sm">{post.body}</p>
                                    <div className="flex">
                                        <button>
                                            <i className="mr-1 fas fa-comment-alt fa-xs"></i>
                                            <span className="font-bold">
                                                {post.commentCount} Comments
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* 댓글 작성 구간 
                            1. 로그인 되어있으면 댓글창이 생김
                            2.username을 클릭하면 유저페이지로 넘어감 `/u/${user.username}`
                            3.{로그인이 안되어 있다면 아래 표시 
                            */}
                            <div className="pr-6 mb-4 pl-9">
                                {authenticated ?
                                    (<div>
                                        <p className="mb-1 text-xs">
                                            <Link href={`/u/${user?.username}`}>
                                                <p className="font-semibold text-blue-500">
                                                    {user?.username}
                                                </p>
                                            </Link>
                                            {" "}으로 댓글 작성
                                        </p>
                                        {/*댓글 박스와 작성 버튼 */}
                                        <form onSubmit={handleSubmit}>
                                            <textarea
                                                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-gray-600"
                                                onChange={e => setNewComment(e.target.value)}
                                                value={newComment}
                                            >
                                            </textarea>
                                            <div className="flex justify-end">
                                                <button
                                                    className="px-3 py-1 text-white bg-gray-400 rounded"
                                                    disabled={newComment.trim() === ""}
                                                >
                                                    댓글 작성
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                    )
                                    :
                                    (<div className="flex items-center justify-between px-2 py-4 border border-gray-200 rounded">
                                        <p className="font-semibold text-gray-400">
                                            댓글 작성을 위해서 로그인 해주세요.
                                        </p>
                                        <div>
                                            <Link href={`/login`}>
                                                <p className="px-3 py-1 text-white bg-gray-400 rounded">
                                                    로그인
                                                </p>
                                            </Link>
                                        </div>
                                    </div>)
                                }
                            </div>
                            {/* 댓글 리스트 부분 */}
                            {comments?.map(comment => (
                                <div className="flex" key={comment.identifier}>
                                     {/* 좋아요 싫어요 기능 부분 post 투표와 다른점은 vote(1,comment)를 추가했다.*/}
                                     <div className="flex-shrink-0 w-10 py-2 text-center rounded-l">
                                        {/* 좋아요 */}
                                        <div
                                            className="flex justify-center w-6 mx-auto text-gray-400 rounded cursor-pointer hover:bg-gray-300 hover:text-red-500"
                                            onClick={() => vote(1, comment)}
                                        >
                                            {comment.userVote === 1 ?
                                                <FaArrowUp className="text-red-500" />
                                                : <FaArrowUp />
                                            }
                                        </div>
                                        <p className="text-xs font-bold">{comment.voteScore}</p>
                                        {/* 싫어요 */}
                                        <div
                                            className="flex justify-center w-6 mx-auto text-gray-400 rounded cursor-pointer hover:bg-gray-300 hover:text-blue-500"
                                            onClick={() => vote(-1, comment)}
                                        >
                                            {comment.userVote === -1 ?
                                                <FaArrowDown className="text-red-500" />
                                                : <FaArrowDown />
                                            }
                                        </div>
                                    </div>

                                    <div className="py-2 pr-2">
                                        <p className="mb-1 text-xs leading-none">
                                            <Link href={`/u/${comment.username}`}>
                                                <p className="mr-1 font-bold hover:underline">
                                                    {comment.username}
                                                </p>
                                            </Link>
                                            <span className="text-gray-600">
                                                {`
                                              ${comment.voteScore}
                                              posts
                                              ${dayjs(comment.createdAt).format("YYYY-MM-DD HH:mm")}
 `}
                                            </span>
                                        </p>
                                        <p>{comment.body}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default PostPage