import { Order } from '../order';
import { OnEvent } from '@nestjs/event-emitter';
import { RedisService } from '../../shared/redis.service';
import { ClientKafka } from '@nestjs/microservices';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class OrderListener {
  constructor(
    private redisService: RedisService,
    @Inject('KAFKA_SERVICE') private client: ClientKafka,
  ) {}

  @OnEvent('order.completed')
  async handleOrderCompletedEvent(order: Order) {
    const client = this.redisService.getClient();
    client.zincrby('rankings', order.ambassador_revenue, order.user.name);
    // produce a message
    const data = {
      ...order,
      total: order.total,
      ambassador_revenue: order.ambassador_revenue,
    };
    await this.client.emit('services', JSON.stringify(data));
  }
}
