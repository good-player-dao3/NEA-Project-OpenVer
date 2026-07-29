import { Core } from 'src/core/core';
import { type BodyAdapter } from 'src/core/bodies';
import { ExclusionManager } from 'src/features/exclusion';

export interface SelectorOptions {
  /** 搜索半径 */
  range: number;
  /** 排除观战/死人 (flags & ghost 掩码) */
  excludeSpectator?: boolean;
}

/**
 * 目标选择器。
 *
 * 封装 Core + ExclusionManager，提供统一的目标查询方法。
 * 无状态 —— 每次调用都实时计算。
 */
export class Selector {
  private core = Core.getInstance();
  private em = ExclusionManager.getInstance();

  /** 获取范围内最近的敌对目标，无目标返回 null */
  getNearest(options: SelectorOptions): BodyAdapter | null {
    const self = this.core.bodies.getSelfBody();
    if (!self) return null;

    let nearest: BodyAdapter | null = null;
    let minDist = Infinity;
    const rangeSq = options.range * options.range;
    const selfPos = self.position.toVector3();

    for (const body of this.core.bodies.getPlayerBodies()) {
      if (body.id === self.id) continue;
      if (this.em.isFriend(body.id)) continue;
      if (options.excludeSpectator && !(body.flags & 6)) continue;
      if ((this.core.damage.getDamageById(body.id)?.hp ?? 1) <= 0) continue;

      const sd = body.position.toVector3().sqrDist(selfPos);
      if (sd > rangeSq) continue;
      if (sd < minDist) {
        minDist = sd;
        nearest = body;
      }
    }

    return nearest;
  }

  /** 获取范围内血量最低的敌对目标，无目标返回 null */
  getLowestHp(options: SelectorOptions): BodyAdapter | null {
    const self = this.core.bodies.getSelfBody();
    if (!self) return null;

    let lowest: BodyAdapter | null = null;
    let minHp = Infinity;
    const rangeSq = options.range * options.range;
    const selfPos = self.position.toVector3();

    for (const body of this.core.bodies.getPlayerBodies()) {
      if (body.id === self.id) continue;
      if (this.em.isFriend(body.id)) continue;
      if (options.excludeSpectator && !(body.flags & 6)) continue;
      if ((this.core.damage.getDamageById(body.id)?.hp ?? 1) <= 0) continue;

      const sd = body.position.toVector3().sqrDist(selfPos);
      if (sd > rangeSq) continue;

      const hp = this.core.damage.getDamageById(body.id)?.hp ?? Infinity;
      if (hp < minHp) {
        minHp = hp;
        lowest = body;
      }
    }

    return lowest;
  }
}
