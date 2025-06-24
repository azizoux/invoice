import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="hero bg-base-200 h-screen">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <SignIn />
        </div>
      </div>
    </div>
  );
}
