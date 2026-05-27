import { ISliderData } from "@/types/slider-type";

// slider data
export const sliderData: ISliderData[] = [
  {
    id: 1,
    pre_title: { text: "Starting at", price: 5000 },
    title: "The best electronics Collection 2023",
    subtitle: {
      text_1: "Exclusive offer ",
      percent: 35,
      text_2: "off this week",
    },
    img: "/assets/img/slider/slider-img-1.png",
    green_bg: true,
  },
  {
    id: 2,
    pre_title: { text: "Starting at", price: 15000 },
    title: "The best refrigerator collection 2023",
    subtitle: {
      text_1: "Exclusive offer ",
      percent: 10,
      text_2: "off this week",
    },
    img: "/assets/img/slider/slider-img-2.png",
    green_bg: true,
  },
  {
    id: 3,
    pre_title: { text: "Starting at", price: 10000 },
    title: "The best refrigerator collection 2023",
    subtitle: {
      text_1: "Exclusive offer ",
      percent: 10,
      text_2: "off this week",
    },
    img: "/assets/img/slider/slider-img-3.png",
    is_light: true,
  },
];
