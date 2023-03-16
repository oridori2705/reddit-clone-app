import { Request, Response, Router } from "express";
import userMiddleware from "../middlewares/user";
import authMiddleware from "../middlewares/auth";
import { User } from "../entities/User";
import Post from "../entities/Post";
import Vote from "../entities/Vote";
import Comment from "../entities/Comment";

const vote = async (req:Request, res:Response) => {
    const { identifier, slug, commentIdentifier, value } = req.body; //요청에서보내는 값을 받아옴

    // -1 0 1의 value 만 오는지 체크
    if(![-1, 0 ,1].includes(value)) { //싫어요 값, 이미 버튼을 눌렀다면의 값, 좋아요 값
        return res.status(400).json({ value: "-1, 0, 1의 value만 올 수 있습니다."});
    }
   
    try {
        //DB값을 적용하기위해 user, post, 값을 가져온다.
        const user: User = res.locals.user; 
        let post: Post = await Post.findOneByOrFail({ identifier, slug}); //post는 요청에서보내온 값들로 바로 가져온다.
        let vote: Vote | null;//Votes DB에 많은 투표들중 내가 누른 vote의 값 하나를 찾아오는 것이다.
        let comment: Comment;

            //comment 투표 값으면 comment의 identifier을 요청에서 보냈다. 없으면 undefined가 나오는 것으로 post투표와 comment투표를 구분한다.
            if(commentIdentifier) {
                // 댓글 식별자가 있는 경우 댓글로 vote 찾기
                comment = await Comment.findOneByOrFail({ identifier: commentIdentifier});
                //그 댓글에 속한 투표를 찾는다.
                vote = await Vote.findOneBy({ username: user.username, commentId: comment.id});
            } else {
                //comment가 아닐경우 포스트에 해당하는 vote 찾기
                vote = await Vote.findOneBy({ username: user.username, postId: post.id});
            }
            
            if(!vote && value === 0 ) {
                //찾은 vote가 없고 value가 0인 경우 오류 반환 -> vote가 아예 없는경우에 value가 0이면 투표를 못하게 막아야함 -> value가 0이면 찾은 투표값을 지우는거니까 아래에서 지움
                return res.status(404).json({ error: "Vote을 찾을 수 없습니다."});
            } else if( !vote) { //찾은 vote가 없을 떄 새로 투표를 클릭한 거니까 Votes DB에 저장한다.
                vote = new Vote();//아래에서 post의 투표인지 comment의 투표인지의 값을 구분해서 변수에 저장후 DB에저장한다.
                vote.user = user;
                vote.value = value;

                // 게시물에 속한 vote or 댓글에 속한 vote
                if(comment!) vote.comment = comment //join을 위해서 comment정보를 넣는다
                else vote.post = post; //join을 위해서 post 정보를 넣는다
                await vote.save();
                //이 아래는 투표가 현재 존재하는 경우에 생기는 조건들이다.
            } else if(value === 0) { //value가 0이면 눌럿던 찾은 vote값을 다시 지우는 거니까 지워준다.
                vote.remove();
            } else if ( vote.value !== value) {//예를들어 이미 좋아요를 눌렀었는데 싫어요를 누른 경우
                vote.value = value; //그러면 현재 찾은 그 투표값을 새로운 값으로 바꿔준다.
                await vote.save();
            }
            
            //post의 정보를 가져오는데 가져올 때 "comments", "comments.votes", "sub"테이블, "votes"테이블을 join해서 가져온다.
            post = await Post.findOneOrFail({
                where: {
                    identifier, slug
                }, 
                relations: ["comments", "comments.votes", "sub", "votes"] 
            })
            
            //이 부분은 즉 현재 사용자가 현재 Post나 comments에 투표를 했는지 안했는지 검사하는 부분이다.
            //즉 현재 사용자데이터를 넣고 엔티티에서는 사용자 이름으로 된 Post의 투표와 Comments(배열->여러개니까)의 투표를 모두 검사해서 userVote 라는 값에 넣는다.
            //만약 투표햇다면 userVote의 value는 1또는 -1을 가진 것이고, 그 값을 프론트에서 사용하게된다.
            //프론트에서는 그 값을 이용해 사용자가 현재 투표했다는 것을 보여주기 위해 화살표 아이콘에(위쪽 또는 아래쪽 화살표) 알맞게 표시한다.
            post.setUserVote(user);
            post.comments.forEach(c => c.setUserVote(user)); //comments는 post와 다르게 여러개이므로 모든 댓글을 검사해야된다. -> 위에서 이미 현재 오픈된 post에 관련된 댓글을 가져왔다.
            return res.json(post);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "문제가 발생했습니다."})
    }
}

const router = Router();
router.post("/", userMiddleware, authMiddleware, vote);
export default router;