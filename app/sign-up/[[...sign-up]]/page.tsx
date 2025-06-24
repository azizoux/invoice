import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="hero bg-base-200 h-screen">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <SignUp />
        </div>
      </div>
    </div>
  );
}
