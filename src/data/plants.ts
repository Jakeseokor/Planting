import type { Plant } from './types'

// 재배 정보는 일반적으로 통용되는 원예 기준. 환경에 따라 달라지는 수치는 범위로 표기한다.
export const plants: Plant[] = [
  {
    id: 'monstera',
    name: '몬스테라',
    scientificName: 'Monstera deliciosa',
    difficulty: 1,
    summary: '갈라진 큰 잎이 멋진 열대 식물',
    lightLevels: ['bright', 'partial'],
    toxicity: { cat: true, dog: true, note: '씹으면 입안이 붓고 침을 흘려요' },
    care: {
      light: '밝은 창가에서 1~2m 안쪽',
      water: '겉흙 2~3cm 마르면 듬뿍',
      temperature: '18~27℃, 10℃ 아래는 피하기',
      humidity: '50~60%, 가끔 잎에 분무',
      soil: '물 잘 빠지는 흙, 1~2년마다 봄에',
      fertilizer: '봄~가을 한 달에 1번 액체비료',
    },
    waterIntervalDays: { warm: 7, cold: 14 },
    steps: [
      '밝은 창가에서 1~2m 떨어진 곳에 둡니다.',
      '겉흙 2~3cm가 마르면 물을 듬뿍 줍니다.',
      '받침에 고인 물은 30분 안에 버립니다.',
      '한 달에 1번 젖은 천으로 잎을 닦습니다.',
      '뿌리가 화분 밖으로 나오면 큰 화분으로 옮깁니다.',
    ],
    cautions: [
      { kind: 'overwater', title: '과습', text: '흙이 늘 젖어 있으면 뿌리가 썩어요' },
      { kind: 'sun', title: '직사광선', text: '한낮 햇빛에 잎이 누렇게 탈 수 있어요' },
      { kind: 'pet', title: '반려동물 독성', text: '고양이·개가 씹으면 입안이 부어요' },
    ],
    seasons: {
      warm: ['7~10일에 1번 물주기', '한 달에 1번 비료', '분갈이는 4~6월에'],
      cold: ['2~3주에 1번 물주기', '비료는 쉬기', '찬 창가에서 떨어뜨리기'],
    },
  },
  {
    id: 'stucky',
    name: '스투키',
    scientificName: 'Sansevieria cylindrica',
    difficulty: 1,
    summary: '막대 모양 잎, 물을 자주 안 줘도 돼요',
    lightLevels: ['bright', 'partial', 'shade'],
    toxicity: { cat: true, dog: true, note: '씹으면 구토·설사를 할 수 있어요' },
    care: {
      light: '밝은 곳이 좋고, 약한 빛도 견뎌요',
      water: '흙이 속까지 다 마르면 듬뿍',
      temperature: '15~30℃, 10℃ 아래는 피하기',
      humidity: '건조해도 괜찮아요(40~50%)',
      soil: '선인장용 흙, 2~3년마다 봄에',
      fertilizer: '봄~여름 2달에 1번 묽게',
    },
    waterIntervalDays: { warm: 21, cold: 42 },
    steps: [
      '밝은 창가나 거실 어디든 둡니다.',
      '나무젓가락을 꽂아 흙이 다 말랐는지 봅니다.',
      '다 말랐으면 화분 밑으로 나올 만큼 줍니다.',
      '물은 잎 사이 말고 흙에만 줍니다.',
      '화분이 꽉 차면 봄에 나눠 심습니다.',
    ],
    cautions: [
      { kind: 'overwater', title: '과습', text: '물을 자주 주면 밑동이 물러져요' },
      { kind: 'cold', title: '추위', text: '10℃ 아래에선 잎이 물러 상해요' },
      { kind: 'pet', title: '반려동물 독성', text: '고양이·개가 씹으면 구토할 수 있어요' },
    ],
    seasons: {
      warm: ['3~4주에 1번 물주기', '2달에 1번 묽은 비료', '포기 나누기는 5~6월에'],
      cold: ['1~2달에 1번 조금만', '비료 주지 않기', '15℃ 이상 실내에 두기'],
    },
  },
  {
    id: 'pothos',
    name: '스킨답서스',
    scientificName: 'Epipremnum aureum',
    difficulty: 1,
    summary: '줄기가 늘어지는 하트 잎 덩굴식물',
    lightLevels: ['bright', 'partial', 'shade'],
    toxicity: { cat: true, dog: true, note: '씹으면 입안이 붓고 침을 흘려요' },
    care: {
      light: '밝은 그늘이 좋고, 그늘도 견뎌요',
      water: '겉흙 2~3cm 마르면 듬뿍',
      temperature: '18~29℃, 10℃ 아래는 피하기',
      humidity: '40~60%, 가끔 잎에 분무',
      soil: '일반 분갈이흙, 1~2년마다 봄에',
      fertilizer: '봄~가을 한 달에 1번 액체비료',
    },
    waterIntervalDays: { warm: 7, cold: 14 },
    steps: [
      '밝은 창가 안쪽이나 선반 위에 둡니다.',
      '겉흙 2~3cm가 마르면 물을 듬뿍 줍니다.',
      '잎이 축 처지면 물이 부족한 신호예요.',
      '줄기가 너무 길면 마디 아래를 자릅니다.',
      '자른 줄기를 물에 꽂으면 2~3주 뒤 뿌리가 나요.',
    ],
    cautions: [
      { kind: 'overwater', title: '과습', text: '흙이 늘 젖어 있으면 잎이 노래져요' },
      { kind: 'sun', title: '직사광선', text: '강한 햇빛에 잎이 하얗게 타요' },
      { kind: 'pet', title: '반려동물 독성', text: '고양이·개가 씹으면 입안이 부어요' },
    ],
    seasons: {
      warm: ['5~7일에 1번 물주기', '한 달에 1번 비료', '가지치기·물꽂이 적기'],
      cold: ['10~14일에 1번 물주기', '비료는 쉬기', '건조하면 잎에 분무'],
    },
  },
]

export const getPlant = (id: string | undefined) => plants.find((p) => p.id === id)
