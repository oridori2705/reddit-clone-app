import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router"
import useSWR from 'swr';
import { Comment, Post } from "../../../../types";
import dayjs from 'dayjs';
import { useAuthState } from "../../../../context/auth";
import { FormEvent, useState } from "react";
//import classNames from 'classnames';
//import { FaArrowUp, FaArrowDown } from "react-icons/fa";

const PostPage = () => {
    const { authenticated, user } = useAuthState(); //댓글 창을 위해 가져옴
    const [newComment, setNewComment] = useState("");

      
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
    const { data: post, error, mutate: postMutate } = useSWR<Post>(identifier && slug ? `/posts/${identifier}/${slug}` : null);
    const { data: comments, mutate: commentMutate } = useSWR<Comment[]>(
        identifier && slug ? `/posts/${identifier}/${slug}/comments` : null
    )
    return (
        <div className="flex max-w-5xl px-4 pt-5 mx-auto">
            <div className="w-full md:mr-3 md:w-8/12">
                <div className="bg-white rounded">
                    {post && (
                        <>
                            <div className="flex">
                                {/* 좋아요 싫어요 기능 부분 */}
                                
                                <div className="py-2 pr-2">
                                    <div className="flex items-center">
                                        <p className="text-xs test-gray-400">
                                            Posted by                     <i className="fas fa-abacus"></i>

                                            <Link href={`/u/${post.username}`}>
                                                <a className="mx-1 hover:underline">
                                                    /u/{post.username}
                                                </a>
                                            </Link>
                                            <Link href={post.url}>
                                                <a className="mx-1 hover:underline">
                                                    {dayjs(post.createdAt).format("YYYY-MM-DD HH:mm")}
                                                </a>
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
                            3.
                            */}
                            <div className="pr-6 mb-4 pl-9">
                                {authenticated ?
                                    (<div>
                                        <p className="mb-1 text-xs">
                                            <Link href={`/u/${user?.username}`}>
                                                <a className="font-semibold text-blue-500">
                                                    {user?.username}
                                                </a>
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
                                    </div>)
                                    :
                                    (<div className="flex items-center justify-between px-2 py-4 border border-gray-200 rounded">
                                        <p className="font-semibold text-gray-400">
                                            댓글 작성을 위해서 로그인 해주세요.
                                        </p>
                                        <div>
                                            <Link href={`/login`}>
                                                <a className="px-3 py-1 text-white bg-gray-400 rounded">
                                                    로그인
                                                </a>
                                            </Link>
                                        </div>
                                    </div>)
                                }
                            </div>
                            {/* 댓글 리스트 부분 */}
                            
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default PostPage