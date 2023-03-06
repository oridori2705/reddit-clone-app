/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['www.gravatar.com',"localhost"], //이미지 src prop 에러 해결 커뮤니티 기본이미지에러와 로컬호스트에 이미지저장할때
  },
}

module.exports = nextConfig
