import React from "react";
import Link from "next/link";

import Search from "@/components/Search";
import useCoinList from "@/hooks/useCoinList";

const CoinList = () => {
  const { listSort, searchedCoinList, offset, limit } = useCoinList();

  return (
    <>
      <div className="sm:w-[38rem] md:w-[40rem] lg:w-[54rem] xl:w-[68rem] flex-none">
        <Search />
        <div>
          <div className="bg-white mb-2 sm:h-[2.5rem] md:h-[2.5rem] lg:h-[2.5rem] xl:h-[3rem] flex flex-row border-2 justify-around items-center border-yellow-200 rounded-lg">
            <p className="w-20 flex items-center justify-center text-xl font-semibold">
              순위
            </p>
            <p
              className="w-44 flex items-center justify-center text-xl font-semibold cursor-pointer"
              id="korean_name"
              onClick={e => listSort(e)}
            >
              코인이름
            </p>
            <p
              className="w-32 flex items-center justify-center text-xl font-semibold cursor-pointer"
              id="trade_price"
              onClick={e => listSort(e)}
            >
              현재가
            </p>
            <p
              className="w-32 flex items-center justify-center text-xl font-semibold cursor-pointer"
              id="signed_change_rate"
              onClick={e => listSort(e)}
            >
              변동률
            </p>
            <p
              className="w-40 flex items-center justify-center text-xl font-semibold cursor-pointer"
              id="acc_trade_price_24h"
              onClick={e => listSort(e)}
            >
              거래대금
            </p>
          </div>
          {searchedCoinList &&
            searchedCoinList.slice(offset, offset + limit).map(coin => (
              <Link
                href={{
                  pathname: "/buy",
                  query: {
                    market_code: `${coin.market}`,
                    korean_name: `${coin.korean_name}`,
                  },
                }}
                key={coin.market}
              >
                <div className="bg-white my-2 sm:h-[2.5rem] md:h-[2.5rem] lg:h-[2.5rem] xl:h-[3rem] flex flex-row border-2 justify-around items-center border-yellow-200 rounded-lg hover:cursor-pointer group">
                  <p className="w-20 flex items-center justify-center group-hover:font-bold">
                    {searchedCoinList.indexOf(coin) + 1}
                  </p>
                  <p className="w-44 flex items-center justify-center group-hover:font-bold">
                    {coin.korean_name}
                  </p>
                  <p className="w-32 flex items-center justify-center group-hover:font-bold">
                    {new Intl.NumberFormat("ko-KR").format(coin.trade_price)}
                  </p>
                  <p
                    className={`w-32 flex items-center justify-center group-hover:font-bold ${
                      coin.signed_change_rate * 100 > 0
                        ? `text-red`
                        : `text-blue`
                    }`}
                  >
                    {(coin.signed_change_rate * 100).toFixed(2)}%
                  </p>
                  <p className="w-40 flex items-center justify-center group-hover:font-bold">
                    {new Intl.NumberFormat("ko-KR").format(
                      parseInt((coin.acc_trade_price_24h / 1000000).toString()),
                    )}
                    백만
                  </p>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </>
  );
};

export default CoinList;
