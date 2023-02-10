"use client";

import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { increment } from "firebase/firestore";

import { useRecoilState, useRecoilValue } from "recoil";

import { updateUserData } from "@/hooks/updateUserData";
import handleNumberFormat from "@/utils/NumberFormat";

import {
  tradingOrderQuantity,
  tradingPurchasePrice,
  tradingTotalOrderAmount,
  tradingIsOrderQuantityChanged,
  tradingIsTotalOderAmountChanged,
  userId,
  userUidAssetData,
} from "@/atoms/atom";
import { IcurrentPrice } from "@/interface/interface";

const Trading = ({ currentPrice }: { currentPrice: IcurrentPrice }) => {
  const [purchasePrice, setPurchasePrice] =
    useRecoilState(tradingPurchasePrice);
  const [orderQuantity, setOrderQuantity] =
    useRecoilState(tradingOrderQuantity);
  const [totalOrderAmount, setTotalOrderAmount] = useRecoilState(
    tradingTotalOrderAmount,
  );
  const [isOrderQuantityChanged, setIsOrderQuantityChanged] = useRecoilState(
    tradingIsOrderQuantityChanged,
  );
  const [isTotalOderAmountChanged, setIsTotalOderAmountChanged] =
    useRecoilState(tradingIsTotalOderAmountChanged);
  const userAssetData = useRecoilValue(userUidAssetData);
  const userUid = useRecoilValue(userId);

  let myCash: number;
  if (userAssetData.asset) myCash = +userAssetData.asset.cash;

  const searchParams = useSearchParams();

  const market_code = searchParams.get("market_code");
  const abbreviatedEnglishName = market_code?.split("-")[1];
  const korean_name = searchParams.get("korean_name");
  const market = `${abbreviatedEnglishName}/KRW`;

  const currentPriceFormat = `${new Intl.NumberFormat("ko-KR").format(
    +currentPrice,
  )} KRW`;

  setPurchasePrice(currentPrice?.toString());

  const handlePurchasePrice = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPurchasePrice(event.target.value.replace(/[^-\.0-9]/g, ""));
  };

  const handleOrderQuantity = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value;

    let splitValue = value.split(".");
    let underDecimal = splitValue[1];
    let int = splitValue[0];

    setIsOrderQuantityChanged(prev => !prev);

    if (underDecimal && underDecimal.length > 8) {
      underDecimal = underDecimal.slice(0, 8);
      value = `${int}.${underDecimal}`;
      setOrderQuantity(value.replace(/[^0-9.]/g, ""));
    } else setOrderQuantity(value.replace(/[^0-9.]/g, ""));
  };

  const handleTotalOrderAmount = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setIsTotalOderAmountChanged(prev => !prev);

    setTotalOrderAmount(event.target.value.replace(/[^0-9]/g, ""));
  };

  const initialization = () => {
    setTotalOrderAmount("0");
    setOrderQuantity("0");
  };

  const handleTotalOrderAmountPercent = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    const percent = Number((event.target as HTMLButtonElement).id);
    if (percent === 10) setTotalOrderAmount((myCash * 0.1).toString());
    if (percent === 25) setTotalOrderAmount((myCash * 0.25).toString());
    if (percent === 50) setTotalOrderAmount((myCash * 0.5).toString());
    if (percent === 100) {
      setTotalOrderAmount((myCash * 0.9995).toString());
    }

    setIsTotalOderAmountChanged(prev => !prev);
  };

  const handleBuy = () => {
    const buyPrice = `asset.data.${abbreviatedEnglishName}.buyPrice`;
    const buyAmount = `asset.data.${abbreviatedEnglishName}.buyAmount`;
    const numberOfShares = `asset.data.${abbreviatedEnglishName}.numberOfShares`;
    const cash = `asset.cash`;

    const isBuyAvailable = myCash >= +totalOrderAmount * 1.0005;
    const purchaseAmount = Math.ceil(+currentPrice * +orderQuantity);

    myCash =
      myCash -
      Number(totalOrderAmount) -
      Math.ceil(Number(totalOrderAmount) * 0.0005);

    const data = {
      [buyPrice]: currentPrice,
      [buyAmount]: increment(+purchaseAmount),
      [numberOfShares]: increment(+orderQuantity),
      [cash]: myCash,
    };

    if (isBuyAvailable) {
      alert("매수 성공!");
      updateUserData(userUid, data);
    } else alert("주문가능 금액이 부족합니다");
  };

  useEffect(() => {
    if (orderQuantity !== "") {
      const totalOrderAmountString = Math.ceil(
        +orderQuantity * +purchasePrice,
      ).toString();
      setTotalOrderAmount(totalOrderAmountString);
    } else setTotalOrderAmount("0");
  }, [isOrderQuantityChanged]);

  useEffect(() => {
    if (totalOrderAmount !== "") {
      const orderQuantityString = (+totalOrderAmount / +purchasePrice)
        .toFixed(8)
        .toString();
      setOrderQuantity(orderQuantityString);
    } else setOrderQuantity("0");
  }, [isTotalOderAmountChanged]);

  useEffect(() => {
    initialization();
  }, []);

  return (
    <section className="bg-white w-[26rem] h-[30rem] rounded-xl border-black-100 border-[3px] px-8 py-8 flex-col items-center">
      <article className="border-black-100 flex items-center justify-between mb-4">
        <button className="bg-yellow-200 w-[10.3rem] h-[3rem] rounded-xl border-black-100 border-[3px] text-white text-lg font-semibold">
          매수
        </button>
        <button className="bg-grey w-[10.3rem] h-[3rem] rounded-xl border-black-100 border-[3px] text-black-100 text-lg font-semibold">
          매도
        </button>
      </article>
      <article className="mb-4">
        <figure className="text-black-200 text-lg py-3.5 border-b border-grey px-1 flex justify-between">
          <div className="flex items-baseline">
            <p>{korean_name}</p>
            <p className="text-black-200 text-xs pl-1">{market}</p>
          </div>
          <div>{currentPriceFormat}</div>
        </figure>
        <figure className="text-black-200 text-lg py-3.5 border-b border-grey px-1 flex justify-between">
          <div>매수가격</div>
          <input
            className="w-36 px-2 pb-0.5 text-right"
            value={new Intl.NumberFormat("ko-KR").format(Number(currentPrice))}
            onChange={handlePurchasePrice}
          />
        </figure>
        <figure className="py-3.5 border-b border-grey px-1 flex justify-between">
          <div className="text-black-200 text-lg">주문수량</div>
          <input
            className="w-36 px-2 pb-0.5 text-right"
            value={handleNumberFormat(orderQuantity)}
            onChange={handleOrderQuantity}
          />
        </figure>
        <figure className=" py-3.5 border-b border-grey px-1 flex justify-between">
          <div className="text-black-200 text-lg">주문총액</div>
          <input
            className="w-36 px-2 pb-0.5 text-right"
            value={handleNumberFormat(totalOrderAmount)}
            onChange={handleTotalOrderAmount}
          />
        </figure>
      </article>
      <article className="bg-yellow-100 rounded-lg border-black-100 border-[3px] flex justify-around items-center mb-4 pt-1.5 pb-2 text-black-100 text-xs font-[Galmuri11] font-semibold">
        <button onClick={handleTotalOrderAmountPercent} id="10">
          10%
        </button>
        <button onClick={handleTotalOrderAmountPercent} id="25">
          25%
        </button>
        <button onClick={handleTotalOrderAmountPercent} id="50">
          50%
        </button>
        <button onClick={handleTotalOrderAmountPercent} id="100">
          100%
        </button>
      </article>
      <article className="border-black flex justify-between">
        <button
          className="bg-yellow-100 w-[7.3rem] h-[3rem] rounded-xl border-black-100 border-[3px] text-black-200 text-base font-[Galmuri11]"
          onClick={initialization}
        >
          초기화
        </button>
        <button
          className="bg-yellow-200 w-[13.3rem] h-[3rem] rounded-xl border-black-100 border-[3px] text-white text-lg font-semibold"
          onClick={handleBuy}
        >
          매수
        </button>
      </article>
    </section>
  );
};

export default Trading;
