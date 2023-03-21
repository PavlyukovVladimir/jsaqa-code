const sorting = require("../../app");

describe("Books names test suit", () => {
  it("Books names should be sorted in ascending order", () => {
    const input = [
      "Гарри Поттер",
      "Властелин Колец",
      "Властелин Колец",
      "Волшебник изумрудного города",
    ];

    const expected = [
      "Властелин Колец",
      "Властелин Колец",
      "Волшебник изумрудного города",
      "Гарри Поттер",
    ];

    const resalt = sorting.sortByName(input);

    expect(resalt).toEqual(expected);
  });

  test("Function should throw exception when user without args", () => {
    expect(() => sorting.sortByName()).toThrow(TypeError);
  });
});
