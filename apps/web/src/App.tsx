import { Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { DesignSystem } from './features/design-system/DesignSystem';
import { ConvokaDetails } from './pages/ConvokaDetails';
import { CreateConvoka } from './pages/CreateConvoka';
import { Dashboard } from './pages/Dashboard';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/design-system" element={<DesignSystem />} />
      <Route path="/c/:id" element={<ConvokaDetails />} />

      {/* Rotas Protegidas */}
      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<Dashboard />} />
        <Route path="/app/create" element={<CreateConvoka />} />
      </Route>
    </Routes>
  );
}

export default App;
