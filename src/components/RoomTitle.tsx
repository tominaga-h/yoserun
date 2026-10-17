/** 「田中さん 送別会」のように空白で区切られていたら、最後の語を藍色にする */
export function RoomTitle({ name, stacked = false }: { name: string; stacked?: boolean }) {
  const i = name.search(/[ 　](?=\S+$)/);
  if (i <= 0) return name;
  return (
    <>
      {name.slice(0, i)}
      {stacked ? <br /> : " "}
      <span className="text-indigo">{name.slice(i + 1)}</span>
    </>
  );
}
