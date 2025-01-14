export class DelayedTrigger {
  private delay: number;
  private timer: NodeJS.Timeout | undefined;

  constructor(delay: number) {
    this.delay = delay;
  }

  public reset(
    onTrigger: () => void
  ) {
    if (this.timer) {
      console.log("clearing timer");
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      onTrigger();
      this.timer = undefined;
    }, this.delay);
  }
}
