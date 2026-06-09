import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import PostList from './pages/PostList'
import PostCreate from './pages/PostCreate'
import PostDetail from './pages/PostDetail'
import PostEdit from './pages/PostEdit'

export default function App() {
  return (
    <BrowserRouter basename="/my-community">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/posts" element={<PostList />} />
        <Route path="/posts/create" element={<PostCreate />} />
        <Route path="/posts/:id" element={<PostDetail />} />
        <Route path="/posts/:id/edit" element={<PostEdit />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
