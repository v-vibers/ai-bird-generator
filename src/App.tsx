import { useSubscribeDev } from '@subscribe.dev/react'
import { SignIn } from './components/SignIn'
import { BirdVideoGenerator } from './components/BirdVideoGenerator'

function App() {
  const { isSignedIn } = useSubscribeDev()

  return isSignedIn ? <BirdVideoGenerator /> : <SignIn />
}

export default App
