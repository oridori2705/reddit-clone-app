export interface User {
    username : string,
    eamil: string,
    updatedAt: string,
    createdAt:string
}

export interface Sub{
    updatedAt: string;
    createdAt:string;
    name:string;
    title:string;
    description:string;
    bannerUrn:string;
    imageUrn:string;
    username:string;
    postst:Post[];
    postCount?:string;
    
    imageUrl:string;
    bannerUrl:string;
}

export interface Post {
    identifier: string;
    title: string;
    slug: string;
    body: string;
    subName: string;
    username: string;
    createdAt: string;
    updatedAt: string;
    sub?: Sub;
  
    url: string;
    userVote?: number;
    voteScore?: number;
    commentCount?: number;
  }
  
  export interface Comment {
    identifier: string;
    body: string;
    username: string;
    createdAt: string;
    updatedAt: string;
    post?: Post;
  
    userVote: number;
    voteScore: number;
  }