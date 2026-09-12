import ApplyForm from '@/components/ApplyForm';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24 bg-white text-black font-sans">
      <div className="z-10 max-w-5xl w-full items-center justify-between text-sm lg:flex">
        <h1 className="text-4xl font-bold tracking-tight mb-8">Vidarbha Education Grant</h1>
      </div>
      
      <div className="w-full max-w-md">
        <p className="mb-6 text-gray-700">
          Apply for the ₹15,000 annual education grant. Due to high volumes of duplicate applications, 
          we require you to prove you are a unique, eligible adult using your Aadhaar. 
          <strong> We will NEVER see your Aadhaar number or save it. </strong>
          Your identity remains completely anonymous.
        </p>

        <ApplyForm />
      </div>
    </main>
  );
}
