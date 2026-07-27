import { initData } from '@telegram-apps/sdk';

const Leaderboard = () => {
    initData.restore()

    return (
        <div>
            <img src={initData.user()?.photo_url} alt="photo picture" className='size-20 rounded-full mx-auto mt-5 border-2 border-fuchsia-500/50 shadow-lg shadow-fuchsia-600/20' />
            <p className="text-2xl text-center font-monda font-bold text-white mt-1">3,000</p>
            <p className='font-montserrat text-center mt-1 text-fuchsia-300 font-semibold text-xs'>Level 1 - 🌟 1st Place</p>

            <div className="flex items-center justify-between mt-6">
                <p className='font-roboto font-bold text-white'>All Leaderboards</p>
                <p className='text-sm font-montserrat text-fuchsia-400 font-semibold cursor-pointer hover:underline'>See all</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800/80 p-3 rounded-2xl mt-3 flex items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-3">
                    <div className={`size-10 rounded-full text-slate-950 flex items-center justify-center font-bold bg-amber-400 shadow-md`}>
                        SA
                    </div>
                    <div>
                        <p className='font-monda text-white font-bold'>Siam Sheikh</p>
                        <p className='text-xs text-slate-400'>1231 - Lvl 10</p>
                    </div>
                </div>
                <p className='text-2xl font-opensans text-amber-400 font-black'>#1</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800/80 p-3 rounded-2xl mt-2 flex items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-3">
                    <img src={initData.user()?.photo_url} alt="photo picture" className='size-10 rounded-full border border-slate-600' />
                    <div>
                        <p className='font-monda text-white font-bold'>Iqbal Labit</p>
                        <p className='text-xs text-slate-400'>1231 - Lvl 10</p>
                    </div>
                </div>
                <p className='text-2xl font-opensans text-slate-300 font-black'>#2</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800/80 p-3 rounded-2xl mt-2 flex items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-3">
                    <img src={initData.user()?.photo_url} alt="photo picture" className='size-10 rounded-full border border-slate-600' />
                    <div>
                        <p className='font-monda text-white font-bold'>Karim jannat</p>
                        <p className='text-xs text-slate-400'>1231 - Lvl 10</p>
                    </div>
                </div>
                <p className='text-2xl font-opensans text-amber-600 font-black'>#3</p>
            </div>
        </div>
    );
};

export default Leaderboard;