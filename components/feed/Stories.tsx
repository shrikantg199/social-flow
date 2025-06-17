"use client";

import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';

export function Stories() {
  const stories = [
    {
      id: 'add',
      name: 'Add Story',
      avatar: null,
      isAdd: true,
    },
    {
      id: 1,
      name: 'Sarah',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      isAdd: false,
    },
    {
      id: 2,
      name: 'Mike',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      isAdd: false,
    },
    {
      id: 3,
      name: 'Emma',
      avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      isAdd: false,
    },
    {
      id: 4,
      name: 'David',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      isAdd: false,
    },
    {
      id: 5,
      name: 'Lisa',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      isAdd: false,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
        <CardContent className="p-4">
          <div className="flex gap-4 overflow-x-auto pb-2">
            {stories.map((story, index) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center gap-2 cursor-pointer min-w-[60px]"
              >
                <div className={`relative ${story.isAdd ? '' : 'p-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full'}`}>
                  {story.isAdd ? (
                    <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Plus className="w-6 h-6 text-white" />
                    </div>
                  ) : (
                    <Avatar className="w-14 h-14 border-2 border-white">
                      <AvatarImage src={story.avatar} alt={story.name} />
                      <AvatarFallback>{story.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  {story.name}
                </span>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}