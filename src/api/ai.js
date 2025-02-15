// import jwt from 'jsonwebtoken'
// import { MessagePlugin } from 'tdesign-vue-next'

// const API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
// const API_KEY = 'b5ea9f1102a8446094d796a48bd3e790.X2OANBzYWSzJsTC9'

// // 生成JWT token
// function generateToken() {
//   try {
//     const [id, secret] = API_KEY.split('.')
    
//     const payload = {
//       api_key: id,
//       exp: Date.now() + 3600 * 1000, // 1小时后过期
//       timestamp: Date.now(),
//     }

//     return jwt.sign(payload, secret, {
//       algorithm: 'HS256',
//       header: { alg: 'HS256', sign_type: 'SIGN' }
//     })
//   } catch (error) {
//     console.error('生成token失败:', error)
//     MessagePlugin.error('认证失败，请检查API配置')
//     throw new Error('Invalid API key')
//   }
// }

// // 发送聊天请求
// export async function sendChatMessage(messages) {
//   const token = generateToken()
  
//   try {
//     const response = await fetch(API_URL, {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify({
//         model: 'glm-4',
//         messages: messages
//       })
//     })

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`)
//     }

//     const data = await response.json()
//     return data.choices[0].message.content
//   } catch (error) {
//     console.error('API请求失败:', error)
//     MessagePlugin.error('请求失败，请稍后重试')
//     throw error
//   }
// } 