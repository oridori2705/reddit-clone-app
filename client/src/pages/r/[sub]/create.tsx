import React from 'react'

const PostCreate = () => {
  return (
    <div className='flex flex-col justify-center pt-16'>
            <div className='w-10/12 mx-auto md:w-96'>
                <div className='p-4 bg-white rounded'>
                    <h1 className='mb-3 text-lg'>포스트 생성하기</h1>
                    <form onSubmit={submitPost}>
                        <div className='relative mb-2'>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                                placeholder="제목"
                                maxLength={20}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                            <div
                                style={{ top: 10, right: 10 }}
                                className="absolute mb-2 text-sm text-gray-400 select-none"
                            >
                                {title.trim().length}/20
                            </div>
                        </div>
                        <textarea
                            rows={4}
                            placeholder="설명"
                            className='w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500'
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                        />
                        <div className='flex justify-end'>
                            <button
                                className='px-4 py-1 text-sm font-semibold text-white bg-gray-400 border rounded'
                            >
                                생성하기
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
  )
}

export default PostCreate


//권한이없는 유저는 login페이지로 보내기 -> 커뮤니티 생성페이지와 동일
export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
    try {
        const cookie = req.headers.cookie; //쿠키는 자동 저장되어있다.
        if (!cookie) throw new Error("쿠키가 없습니다.")

        await axios.get(`${process.env.NEXT_PUBLIC_SERVER_BASE_URL}/api/auth/me`,
            { headers: { cookie } })
        return { props: {} }
    } catch (error) {
        res.writeHead(307, { Location: "../login" }).end()
        
        return { props: {} }
    }
}