class MockAnimationFrame {
  private originalRequestAnimationFrame: (callback: FrameRequestCallback) => number
  private originalCancelAnimationFrame: (handle: number) => void
  private queued: { [key: number]: FrameRequestCallback } = {}
  private currentAnimationFrame = 0

  public mock(): void {
    this.originalRequestAnimationFrame = window.requestAnimationFrame
    window.requestAnimationFrame = this.requestAnimationFrame

    this.originalCancelAnimationFrame = window.cancelAnimationFrame
    window.cancelAnimationFrame = this.cancelAnimationFrame
  }

  public restore(): void {
    window.requestAnimationFrame = this.originalRequestAnimationFrame
    window.cancelAnimationFrame = this.originalCancelAnimationFrame
  }

  public async runFrame(): Promise<void> {
    for await (const frame of Object.keys(this.queued)) {
      const callback = this.queued[frame]
      delete this.queued[frame]
      await callback(Date.now())
    }
  }

  private requestAnimationFrame = (callback: FrameRequestCallback): number => {
    this.currentAnimationFrame += 1
    this.queued[this.currentAnimationFrame] = callback
    return this.currentAnimationFrame
  }

  private cancelAnimationFrame = (frame: number): void => {
    delete this.queued[frame]
  }
}

export const mockAnimationFrame = new MockAnimationFrame()
